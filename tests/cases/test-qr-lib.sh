#!/usr/bin/env bash
#
# Smoke-test the vendored front-end QR library so a corrupted or truncated
# assets/qrcode-generator.js is caught in CI. Requires node; skipped if absent.
# Discovered and reported by tests/run-tests.sh.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT" || exit 1

LIB="assets/qrcode-generator.js"
if [[ ! -f "$LIB" ]]; then
  echo "missing $LIB" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node not found — skipping QR library smoke test" >&2
  exit 0
fi

node - "$LIB" <<'NODE'
const path = require("path");
const qrcode = require(path.resolve(process.argv[2]));

if (typeof qrcode !== "function") {
  console.error("qrcode is not a function after require");
  process.exit(1);
}

// typeNumber 0 auto-selects the smallest version that fits.
const qr = qrcode(0, "H");
qr.addData("https://cportka.github.io/generate-qr-code/");
qr.make();

const count = qr.getModuleCount();
if (count < 21 || ((count - 21) % 4) !== 0) {
  console.error("unexpected module count: " + count);
  process.exit(1);
}
// Finder pattern: the very top-left module of a QR code is always dark.
if (qr.isDark(0, 0) !== true) {
  console.error("finder pattern missing: isDark(0,0) should be true");
  process.exit(1);
}
if (typeof qr.isDark(3, 3) !== "boolean") {
  console.error("isDark did not return a boolean");
  process.exit(1);
}
console.log("qrcode-generator OK — " + count + "x" + count + " modules");
NODE
