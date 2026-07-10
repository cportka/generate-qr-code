#!/usr/bin/env bash
#
# Run the Python unit tests for generate_qr.py. Discovered and reported by tests/run-tests.sh.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT" || exit 1

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 not found — skipping Python tests" >&2
  exit 0
fi

# Run the test file directly — it imports generate_qr.py by absolute path, so it needs no
# package layout (no tests/__init__.py) and works from any cwd.
python3 tests/test_generate_qr.py -v
