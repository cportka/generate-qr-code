# test_generate_qr.py — unit tests for the generate_qr CLI module.
#
# Importing the module must not trigger a network install (the qrcode import is lazy), so the
# pure helpers can be tested anywhere. The end-to-end PNG test runs only when qrcode + Pillow
# are installed, and is skipped otherwise so the suite stays green in a minimal environment.
import importlib.util
import os
import pathlib
import re
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Import generate_qr.py by path so the test doesn't depend on cwd / packaging.
_spec = importlib.util.spec_from_file_location("generate_qr", ROOT / "generate_qr.py")
generate_qr = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(generate_qr)


def _qrcode_available():
    try:
        import qrcode  # noqa: F401
        import PIL  # noqa: F401
    except Exception:
        return False
    return True


class SanitizeFilename(unittest.TestCase):
    def test_strips_reserved_characters(self):
        dirty = 'https://ex.com/a?b=c*d:e"f<g>h|i\\j/k'
        cleaned = generate_qr.sanitize_filename(dirty)
        self.assertNotRegex(cleaned, r'[\\/*?:"<>|]')

    def test_keeps_safe_characters(self):
        self.assertEqual(
            generate_qr.sanitize_filename("hello-world_123.png"),
            "hello-world_123.png",
        )

    def test_returns_string(self):
        self.assertIsInstance(generate_qr.sanitize_filename(""), str)


class GenerateQrCode(unittest.TestCase):
    @unittest.skipUnless(_qrcode_available(), "qrcode/Pillow not installed")
    def test_writes_png(self):
        url = "https://example.com/test"
        with tempfile.TemporaryDirectory() as tmp:
            cwd = os.getcwd()
            os.chdir(tmp)
            try:
                filename = generate_qr.generate_qr_code(url)
                self.assertTrue(filename.endswith(".png"))
                self.assertTrue(os.path.isfile(filename))
                self.assertGreater(os.path.getsize(filename), 0)
                with open(filename, "rb") as fh:
                    self.assertEqual(fh.read(8), b"\x89PNG\r\n\x1a\n")
            finally:
                os.chdir(cwd)


if __name__ == "__main__":
    unittest.main()
