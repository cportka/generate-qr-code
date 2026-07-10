# QR Code Generator

> **Version:** 0.2.0 · **Live site:** [cportka.github.io/generate-qr-code](https://cportka.github.io/generate-qr-code/) · **License:** [MIT](./LICENSE) · **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

Generate a QR code for any URL or text — either in your **browser** (a private, no-upload web app)
or from the **command line** (a small Python script). Part of [Portka Tools](https://cportka.github.io/claude-plugins/).

## Web app

A single static page, hosted on GitHub Pages: **[cportka.github.io/generate-qr-code](https://cportka.github.io/generate-qr-code/)**.

- **Private by design.** Encoding happens locally in your browser with the bundled, MIT-licensed
  [`qrcode-generator`](https://github.com/kazuhikoarase/qrcode-generator) library. Your text never
  leaves your device — there is no server and no network request.
- **Controls.** Error-correction level (L/M/Q/H, default **H**), quiet zone, foreground/background
  colors, and an optional transparent background, all with a live preview.
- **Export.** Download a crisp **PNG** (512 / 1024 / 2048 px, or a **custom** width × height) or a
  scalable **SVG**, or copy the image to your clipboard — copy uses the same size setting as the
  PNG download.

It's plain HTML/CSS/JS with no build step and no third-party origins, so it works offline and under a
strict Content-Security-Policy.

### Deploying

The site deploys from the `main` branch (root) via GitHub Pages — merging to `main` publishes it.
No build step is required; `index.html`, `assets/`, and the SEO files (`robots.txt`, `sitemap.xml`,
`.nojekyll`, `favicon.svg`) are served as-is.

## Command line

The original `generate_qr.py` script saves a 2048×2048 PNG named after a sanitized version of the URL.

### Requirements

- Python 3
- pip (the script installs the `qrcode[pil]` library on first use if it isn't already present)

### Usage

```
$ python generate_qr.py
Please enter the URL you want to generate a QR code for: https://www.example.com
QR code generated successfully!
```

The image is written to the current directory. You can also import the helpers:

```python
from generate_qr import generate_qr_code, sanitize_filename

generate_qr_code("https://example.com")   # writes example.com.png
```

## Development

This repo follows the [Portka standard workflow](./.claude/CLAUDE.md): every change goes on a branch,
updates tests + CI, and merges on green. The version follows [SemVer](https://semver.org) and stays
in sync across `VERSION`, `CHANGELOG.md`, and the README `**Version:**` line above — enforced by the
test suite:

```
bash tests/run-tests.sh
```

That runner checks the version sync and then runs the cases in `tests/cases/` — the Python unit tests
(`tests/test_generate_qr.py`) and a smoke test of the vendored front-end QR library. CI
(`.github/workflows/portka-standard.yml`) runs the same suite on every push and pull request.

## Credits

- Front-end encoding: [`qrcode-generator`](https://github.com/kazuhikoarase/qrcode-generator) by
  Kazuhiko Arase (MIT), vendored unmodified at `assets/qrcode-generator.js`.

## License

[MIT](./LICENSE) — © Chris Portka.
