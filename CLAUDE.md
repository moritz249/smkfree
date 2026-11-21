# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

SMKFREE: a privacy-first smoke-free tracker (cigarettes, roll-your-own, vaping) that renders progress as a shareable "receipt". Plain HTML/CSS/vanilla JS ES modules, **no bundler and no build step for the website**. The repo root is served as-is by GitHub Pages; the same code ships as iOS/Android apps via Capacitor 8. No backend, accounts, or analytics: all data lives in `localStorage` (mirrored to native Preferences in the apps).

## Commands

```bash
npm test                                   # node --test (Node 20+), runs tests/*.test.js
node --test tests/app-core.test.js         # single file
node --test --test-name-pattern="dailySaving"   # single test by name
npm run serve                              # http-server on :8000, caching disabled (or: python -m http.server 8000)
npm run build                              # copy site into www/ (Capacitor webDir)
npm run sync / sync:ios / sync:android     # build + npx cap sync
npx cap open android | ios
npx capacitor-assets generate --assetPath resources --ios --android   # regenerate icons/splash
```

There is no linter configured. `.claude/launch.json` in the parent folder defines a `smkfree-web` preview server on port 8000.

## Architecture

- `app.js` (large): all UI and side effects — the onboarding wizard (steps, validation), receipt rendering, themes/custom color, savings goal, reminders, craving SOS timer, sharing/download via html2canvas, toolbar and "More" menu. Imports pure logic from `app-core.js`, translations from `i18n.js`, and platform features from `native.js`.
- `app-core.js`: pure, DOM-free calculations (progress per mode, German historical pack-price interpolation for "advanced" spend, daily savings, goal progress, notification plan). This is the tested layer; keep new logic here when it can be pure. It receives the translator via `options.t` rather than importing `i18n.js`.
- `native.js`: thin Capacitor bridge reading `window.Capacitor` at runtime (no imports). Every call must have a web fallback or no-op so the PWA keeps working. It also mirrors `localStorage` keys into native Preferences because iOS WKWebView storage can be evicted — **when adding a new persisted key, add it to `MIRRORED_KEYS` here and to the key list cleared in `resetApp()` in `app.js`**.
- Storage: main state under `smoke-free-progress` with `STORAGE_VERSION` (app.js); a version mismatch currently discards stored state, so changing the state shape means bumping the version or writing a migration.
- `i18n.js`: English text is the key; `t("English text")` returns the active language's string. Only a `de` dictionary exists. HTML opts in via `data-i18n`, `data-i18n-placeholder`, `data-i18n-aria`.

### Translation tests are regex-based

`tests/i18n.test.js` scans source text, so conventions matter:
- Every `t("...")` literal in `app.js` and every `tr("...")` in `app-core.js` must have a German entry with identical `{placeholders}`.
- Strings in `app.js` object literals keyed `title:`, `detail:`, or `label:` are also required to be translated.
- Dictionary entries must stay in the `"key": "value",` one-per-line (or value on next line) format the regex parses.

## Release/caching gotchas

- `sw.js` serves cache-first. After changing any shipped file, bump `CACHE` (`smkfree-vNN`) and, if adding files, update its `ASSETS` list.
- `index.html` loads `styles.css?v=…` and `app.js?v=…`; bump these query strings on changes.
- New top-level web files must also be added to the `files` list in `scripts/build-web.mjs`, otherwise they won't reach the native apps.
- `www/`, `android/app/src/main/assets/public/`, and `ios/App/App/public/` are generated copies (gitignored) — edit the root files, never these.

## Android test builds

Debug APKs for testers: `npm run sync:android`, then `gradlew.bat assembleDebug` in `android/` (needs JDK 21 and the Android SDK; `android/local.properties` with `sdk.dir` is per machine). Output: `android/app/build/outputs/apk/debug/app-debug.apk`. Bump `versionCode` in `android/app/build.gradle` per build, and build on the same machine (its `~/.android/debug.keystore` signs it), or testers must uninstall first.

## Docs

`docs/IOS.md`, `docs/ANDROID.md` (store/build walkthroughs) and `docs/BACKLOG.md` (prioritized open work) are written in German. Health milestones and life-expectancy figures are sourced estimates; disclaimers and sources live in `legal.html` and must stay (App Store guideline 1.4.1).
