// Copies the static web app into www/ so Capacitor can bundle it into the iOS app.
// The repository root stays a plain static site for GitHub Pages.
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "www");
const files = [
  "index.html", "legal.html", "install.html", "app.js", "app-core.js", "native.js", "i18n.js",
  "styles.css", "manifest.webmanifest", "sw.js", "assets",
];

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const file of files) cpSync(join(root, file), join(out, file), { recursive: true });
rmSync(join(out, "assets", "screenshot.png"), { force: true });
rmSync(join(out, "assets", "share-card.png"), { force: true });
console.log(`Copied ${files.length} entries to www/`);
