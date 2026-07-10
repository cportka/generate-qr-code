# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com) and the project uses
[Semantic Versioning](https://semver.org). Every change bumps the version and adds an entry below.

## [0.2.0] - 2026-07-10

### Added
- **Custom download size**: the front-end's "Download size" now offers a **Custom…** option with
  width and height inputs, so you can export a QR at any dimensions (e.g. 1500×900). Non-square
  requests place the code, centered, on a canvas of exactly the requested size.

### Changed
- **Copy image** now uses the same export path as Download PNG, so it always reflects the selected
  size — including a custom width/height.

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
