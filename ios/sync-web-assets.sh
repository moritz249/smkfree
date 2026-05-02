#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$ROOT/ios/SMKFREE/Web"
mkdir -p "$WEB"
cp "$ROOT/index.html" "$ROOT/styles.css" "$ROOT/app.js" "$ROOT/manifest.webmanifest" "$ROOT/legal.html" "$ROOT/install.html" "$WEB/"
rm -rf "$WEB/assets"
cp -R "$ROOT/assets" "$WEB/assets"
echo "Synced web assets to ios/SMKFREE/Web"
