// Takes app screenshots with headless Edge over the DevTools protocol.
// Usage: npm run screenshots   (serve the app first: npm run serve). Writes docs/screenshots/*.png
// Demo data only; nothing of your own app data is used.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { pathToFileURL } from "node:url";

const outDir = process.argv[2] || "docs/screenshots";
fs.mkdirSync(outDir, { recursive: true });
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "smk-shots-"));
const port = 9333;
const edge = spawn(EDGE, [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--headless=new", "--hide-scrollbars", "--no-first-run", "about:blank"], { stdio: "ignore" });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i += 1) {
  await wait(200);
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    wsUrl = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
  } catch { /* not up yet */ }
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
const send = (method, params = {}) => new Promise((resolve) => { id += 1; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
const run = async (expr) => {
  const res = await send("Runtime.evaluate", { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true });
  if (res.result?.exceptionDetails) console.log("JS error:", JSON.stringify(res.result.exceptionDetails).slice(0, 300));
  return res.result?.result?.value;
};

// Demo data: 103 days smoke-free, a few diary entries, today's check-in, blue receipt.
const now = Date.now();
const day = 86400000;
const seed = {
  "smoke-free-progress": JSON.stringify({ version: 4, wizardDone: true, mode: "cigarettes", isAdvanced: false, notStoppedYet: false, showBenefits: false, quitDate: "2026-08-12", smokingStartDate: "", currencyCode: "EUR", cigarettesPerDay: 15, cigarettesPerPack: 20, pricePerPack: 8.5, rollsPerDay: 0, weeklyRyoCost: 0, mlPerWeek: 0, costPer10ml: 0, accessoriesPerMonth: 0 }),
  "smkfree-language": "de",
  "smkfree-hint-receipt": "1",
  "smkfree-cravings": "14",
  // The last seven days, newest last: strong at first, calmer towards today.
  "smkfree-checkins": JSON.stringify(Object.fromEntries([3, 2, 2, 1, 0, 1, 0].map((level, index) => {
    const date = new Date(now - (6 - index) * day);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return [key, level];
  }))),
  "smkfree-diary": JSON.stringify({ entries: [
    { id: "a", at: now - 2 * 3600000, kind: "craving", trigger: "coffee", note: "Kurz rausgegangen, Wasser getrunken" },
    { id: "b", at: now - day - 5 * 3600000, kind: "craving", trigger: "stress", note: "" },
    { id: "c", at: now - 3 * day, kind: "craving", trigger: "alcohol", note: "Freunde gefragt, ob wir reingehen" },
  ] }),
  "smkfree-theme": "custom",
  "smkfree-custom-color": "#2563eb",
};

await send("Page.enable");
await send("Runtime.enable");
await send("Page.addScriptToEvaluateOnNewDocument", {
  source: `try { const seed = ${JSON.stringify(seed)}; if (!sessionStorage.getItem("seeded")) { localStorage.clear(); for (const k in seed) localStorage.setItem(k, seed[k]); sessionStorage.setItem("seeded", "1"); } } catch (e) {}`,
});

async function shot(name, { scheme = "dark", steps = "", height = 844, delay = 900 } = {}) {
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height, deviceScaleFactor: 3, mobile: true });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: scheme }, { name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Page.navigate", { url: "http://localhost:8000/" });
  await wait(1800);
  await run(`const w = (ms) => new Promise((r) => setTimeout(r, ms)); ${steps}`);
  await wait(delay);
  const res = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(res.result.data, "base64"));
  console.log("saved", name);
}

const go = (tab) => `document.querySelector('.tab-button[data-tab=${tab}]').click(); await w(400);`;

for (const scheme of ["dark", "light"]) {
  await shot(`start-${scheme}`, { scheme, steps: go("start") });
  await shot(`sos-${scheme}`, { scheme, steps: `${go("start")} document.querySelector('[data-go=sos]').click();`, delay: 5200 });
  await shot(`receipt-${scheme}`, { scheme, steps: `${go("receipt")} await w(2500); window.scrollTo(0, 0);` });
}
await shot("health-dark", { steps: `${go("start")} document.querySelector('#bodyCard').click(); await w(400);` });
await shot("checkin-dark", { steps: `${go("start")} document.querySelector('#boardTodayKey').click(); await w(600);` });
await shot("actions-dark", { steps: `${go("start")} document.querySelector('#actionButton').click(); await w(600);` });
await shot("life-dark", { steps: `${go("start")} document.querySelector('#boardLife').click(); await w(600);` });
await shot("diary-dark", { steps: go("diary") });
for (const scheme of ["dark", "light"]) {
  await shot(`share-${scheme}`, { scheme, steps: `${go("start")} document.querySelector('#startShare').click(); await w(2500);` });
  // The short share picture itself, exactly as it is sent.
  const cardUrl = await run("return document.querySelector('#sharePreview').src;");
  if (cardUrl?.startsWith("data:image/png;base64,")) {
    fs.writeFileSync(path.join(outDir, `share-card-${scheme}.png`), Buffer.from(cardUrl.split(",")[1], "base64"));
    console.log(`saved share-card-${scheme}`);
  }
}

// A wide picture for sharing: four phones side by side.
const files = ["start-dark", "sos-dark", "receipt-dark", "checkin-dark"].map((n) => pathToFileURL(path.resolve(outDir, n + ".png")).href);
const collage = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:2400px;height:1260px;background:radial-gradient(circle at 30% 20%,#0a3a8a,#000 70%);font-family:Segoe UI,system-ui,sans-serif}
h1{position:absolute;left:120px;top:70px;margin:0;color:#fff;font-size:76px;letter-spacing:-1px}
p{position:absolute;left:120px;top:170px;margin:0;color:#9db6e8;font-size:36px}
.row{position:absolute;left:120px;right:120px;bottom:-60px;display:flex;gap:56px;justify-content:center}
img{width:500px;border-radius:56px;border:10px solid #1c1c1e;box-shadow:0 30px 80px rgba(0,0,0,.6)}
</style><h1>smkfree</h1><p>Rauchfrei-Tracker · kein Konto · alles bleibt auf deinem Handy</p>
<div class="row">${files.map((f) => `<img src="${f}">`).join("")}</div>`;
const collageFile = path.join(profile, "collage.html");
fs.writeFileSync(collageFile, collage);
await send("Emulation.setDeviceMetricsOverride", { width: 2400, height: 1260, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: pathToFileURL(collageFile).href });
await wait(1500);
const wide = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync(path.join(outDir, "share-collage.png"), Buffer.from(wide.result.data, "base64"));
console.log("saved share-collage");

ws.close();
edge.kill();
