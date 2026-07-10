# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com) and the project uses
[Semantic Versioning](https://semver.org). Every change bumps the version and adds an entry below.

## [0.1.0] - 2026-07-09

### Added
- **Browser front-end for GitHub Pages** (`index.html` + `assets/`): a private, client-side QR code
  generator. Encoding runs locally with the bundled MIT `qrcode-generator` library — nothing is
  uploaded. Live preview, adjustable error-correction level, quiet zone and colors, and PNG/SVG
  downloads plus copy-to-clipboard.
- SEO/crawlability + sharing metadata for the site: canonical URL, Open Graph / Twitter tags,
  a `WebApplication` JSON-LD block, a source-visible `<meta>` Content-Security-Policy,
  `robots.txt`, `sitemap.xml`, `.nojekyll`, and a favicon.
- **Portka standard** integration: a workflow `CLAUDE.md`, a `.claude/settings.json` that registers
  the `portka-tools` marketplace (with `app-website-evaluator` + `repo-bootstrap` enabled) and a
  git/`gh` permissions allowlist, an enforced SemVer version sync (`VERSION` / `CHANGELOG.md` /
  README `**Version:**`), a `tests/run-tests.sh` suite, and a `portka-standard` CI workflow.
- Test suite: unit tests for `generate_qr.py` and a smoke test that the vendored QR library encodes
  correctly.

### Changed
- `generate_qr.py` now imports `qrcode` lazily (inside the generation function) instead of at module
  load, so the module can be imported and unit-tested without triggering a network install. The
  command-line behavior is unchanged.
