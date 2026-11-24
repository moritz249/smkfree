# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

SMKFREE: a privacy-first smoke-free tracker (cigarettes, roll-your-own, vaping) that renders progress as a shareable "receipt". Plain HTML/CSS/vanilla JS ES modules, **no bundler and no build step for the website**. The repo root is served as-is by GitHub Pages; the same code ships as iOS/Android apps via Capacitor 8. No backend, accounts, or analytics: all data lives in `localStorage` (mirrored to native Preferences in the apps).

## Commands

```bash
npm test                                   # node --test (Node 20+), runs tests/*.test.js
node --test tests/app-core.test.js         # single file
node --test --test-name-pattern="dailySaving"   # single test by name
npm run serve                              # local server on :8000 without caching (scripts/serve.mjs, no dependencies)
npm run screenshots                        # needs `npm run serve` running: demo screenshots + share collage into docs/screenshots (headless Edge)
npm run build                              # copy site into www/ (Capacitor webDir)
npm run sync / sync:ios / sync:android     # build + npx cap sync
npx cap open android | ios
npx capacitor-assets generate --assetPath resources --ios --android   # regenerate icons/splash
```

There is no linter configured. `.claude/launch.json` in the parent folder defines a `smkfree-web` preview server on port 8000 (`node scripts/serve.mjs`, no caching).

Start of a new session: read `docs/BACKLOG.md` (section „Als Nächstes“) and `docs/UI-RICHTLINIEN.md`. The owner writes in German; the app is German-first (English is the i18n key language). Build an APK only when asked.

## Architecture

- `app.js` (large): all UI and side effects. Tabs: Start (gauge, cards, body, Suchtprotokoll row, craving tile), Tagebuch, Bon, Einstellungen (`data-tab="more"`); sub pages health, plan and sos with a top-left „‹ Zurück“ and history entries (`SUB_PAGES`, `goBack()`); sheets for everything small (`openSheet`/`closeSheet`). Also the onboarding wizard, the craving SOS breathing (frame-based, `breathAt`), sharing (`openShareSheet`: short receipt = clone of the receipt top captured by html2canvas onto 1200×960, whole receipt, or app link only), the update check/banner, and the "+" action sheet. Imports pure logic from `app-core.js`, translations from `i18n.js`, and platform features from `native.js`.
- Looks are two separate things: the **app design** (`data-ui-theme` on `<html>`: standard, mint, lavender, dracula; light/dark via `data-appearance`; only CSS variables in `ios.css`) and the **receipt look** ("Bon anpassen": color, paper/background, font, sticker; unlock lists `RECEIPT_COLORS/PAPERS/FONTS/STICKERS` in `app-core.js`, applied by `applyReceiptLook`). Stickers are bundled Noto Emoji SVGs in `assets/stickers/` (license file there, credited in `legal.html`); they are shown as PNG copies because html2canvas cannot draw those SVGs.
- `styles.css` is the old receipt-era base, `ios.css` the native look on top. `ios.css` grew in rounds: later rules override earlier ones, so add new rules at the end in a labelled section (cleanup is in the backlog).
- `app-core.js`: pure, DOM-free calculations (progress per mode with calendar years/months via `calendarDiff`, German historical pack-price interpolation for "advanced" spend, daily savings, goal steps incl. anniversaries past ten years, notification plan, unlock lists). This is the tested layer; keep new logic here when it can be pure. It receives the translator via `options.t` rather than importing `i18n.js`.
- `native.js`: thin Capacitor bridge reading `window.Capacitor` at runtime (no imports). Every call must have a web fallback or no-op so the PWA keeps working. It also mirrors `localStorage` keys into native Preferences because iOS WKWebView storage can be evicted — **when adding a new persisted key, add it to `MIRRORED_KEYS` here and to the key list cleared in `resetApp()` in `app.js`**.
- Storage: main state under `smoke-free-progress` with `STORAGE_VERSION` (app.js); a version mismatch currently discards stored state, so changing the state shape means bumping the version or writing a migration.
- `i18n.js`: English text is the key; `t("English text")` returns the active language's string. Only a `de` dictionary exists. HTML opts in via `data-i18n`, `data-i18n-placeholder`, `data-i18n-aria`.

### Translation tests are regex-based

`tests/i18n.test.js` scans source text, so conventions matter:
- Every `t("...")` literal in `app.js` and every `tr("...")` in `app-core.js` must have a German entry with identical `{placeholders}`.
- Strings in `app.js` object literals keyed `title:`, `detail:`, or `label:` are also required to be translated.
- Dictionary entries must stay in the `"key": "value",` one-per-line (or value on next line) format the regex parses.

## Release/caching gotchas

- `sw.js` serves HTML/JS/CSS network-first (cache only when offline) and images cache-first. After changing any shipped file, bump `CACHE` (`smkfree-vNN`): a changed `sw.js` is how installed PWAs notice a new version (the app checks on start and on every return to the foreground, reloads when idle, otherwise shows an "Update" banner). If adding files, update its `ASSETS` list.
- `index.html` loads `styles.css?v=…` and `app.js?v=…`; bump these query strings on changes.
- New top-level web files must also be added to the `files` list in `scripts/build-web.mjs`, otherwise they won't reach the native apps.
- `www/`, `android/app/src/main/assets/public/`, and `ios/App/App/public/` are generated copies (gitignored) — edit the root files, never these.

## Android test builds

Debug APKs for testers: `npm run sync:android`, then `gradlew.bat assembleDebug` in `android/` (needs JDK 21 and the Android SDK; `android/local.properties` with `sdk.dir` is per machine). Output: `android/app/build/outputs/apk/debug/app-debug.apk`. Bump `versionCode` in `android/app/build.gradle` per build, and build on the same machine (its `~/.android/debug.keystore` signs it), or testers must uninstall first.

## Docs

`docs/IOS.md`, `docs/ANDROID.md` (store/build walkthroughs), `docs/BACKLOG.md` (prioritized open work) and `docs/UI-RICHTLINIEN.md` (UI guidelines: spacing, radii, colors, components — follow them for every new screen) are written in German. Health milestones and life-expectancy figures are sourced estimates; disclaimers and sources live in `legal.html` and must stay (App Store guideline 1.4.1).
