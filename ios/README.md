# SMKFREE iOS

Native iOS wrapper for the SMKFREE web app.

## What this is

- SwiftUI app shell
- `WKWebView` loading bundled local web assets from `SMKFREE/Web/`
- No backend, no tracking, no network dependency for the core app
- External links open in Safari

## Build

```bash
xcodebuild -project ios/SMKFREE.xcodeproj \
  -scheme SMKFREE \
  -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  CODE_SIGNING_ALLOWED=NO \
  build
```

For device/TestFlight/App Store builds, set a real Apple Developer Team and bundle id in Xcode.

## Sync web assets

After changing the web app, refresh the bundled iOS assets:

```bash
./ios/sync-web-assets.sh
```
