import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../i18n.js", import.meta.url), "utf8");
const pairs = [...source.matchAll(/^\s+"((?:[^"\\]|\\.)+)":\s*\n?\s*"((?:[^"\\]|\\.)*)",?$/gm)].map((m) => [m[1], m[2]]);
const known = new Set(pairs.map(([key]) => key));
const vars = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

test("German dictionary has entries", () => {
  assert.ok(pairs.length > 150, `only ${pairs.length} entries parsed`);
});

test("every translation keeps the same placeholders as its English key", () => {
  for (const [key, value] of pairs) assert.equal(vars(value), vars(key), `placeholder mismatch in "${key}"`);
});

test("every t() key used in app.js has a German translation", () => {
  const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
  const used = [...app.matchAll(/\bt\("((?:[^"\\]|\\.)+)"/g)].map((m) => m[1]);
  const missing = [...new Set(used)].filter((key) => !known.has(key));
  assert.deepEqual(missing, []);
});

test("milestones, breathing phases and notification texts are translated", () => {
  const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
  const core = readFileSync(new URL("../app-core.js", import.meta.url), "utf8");
  const appKeys = [...app.matchAll(/(?:title|detail|label): "([^"]+)"/g)].map((m) => m[1]);
  const coreKeys = [...core.matchAll(/\btr\("((?:[^"\\]|\\.)+)"/g)].map((m) => m[1]);
  const missing = [...new Set([...appKeys, ...coreKeys])].filter((key) => !known.has(key));
  assert.deepEqual(missing, []);
});

test("every data-i18n text in index.html has a German translation", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8").replace(/&amp;/g, "&");
  const used = [...html.matchAll(/data-i18n>([^<]+)</g)].map((m) => m[1].trim().replace(/\s+/g, " "));
  const missing = [...new Set(used)].filter((key) => !known.has(key));
  assert.deepEqual(missing, []);
});
