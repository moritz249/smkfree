# iOS: Vom Code aufs iPhone und in den App Store

Das iOS-Projekt liegt fertig unter `ios/`. Auf dem Mac sind nur noch diese Schritte nötig.

## 1. Mac einrichten (einmalig, ca. 1 Stunde)

1. **Xcode** aus dem Mac App Store installieren und einmal öffnen (Zusatzkomponenten installieren lassen).
2. **Node.js LTS** installieren: <https://nodejs.org>
3. Projekt auf den Mac holen (Git-Repo klonen oder Ordner kopieren), dann im Terminal:

   ```bash
   cd smkfree
   npm install
   npm run sync
   ```

   `npm run sync` kopiert die Website nach `www/` und aktualisiert das iOS-Projekt.

## 2. Prototyp auf dem eigenen iPhone (kostenlos, ohne Developer Account)

1. `npx cap open ios` öffnet das Projekt in Xcode.
2. Xcode → **Settings → Accounts** → mit der normalen Apple-ID anmelden.
3. Links das Projekt **App** wählen → Tab **Signing & Capabilities** → bei **Team** deine Apple-ID („Personal Team“) wählen.
   Falls die Bundle-ID schon vergeben ist: `io.github.moritz249.smkfree` z. B. auf `io.github.moritz249.smkfree.dev` ändern.
4. iPhone per Kabel anschließen, oben in Xcode als Ziel auswählen, **▶ Run** drücken.
5. Auf dem iPhone: **Einstellungen → Datenschutz & Sicherheit → Entwicklermodus** aktivieren, und unter
   **Allgemein → VPN & Geräteverwaltung** dem Entwickler vertrauen.

Hinweis: Mit kostenloser Apple-ID läuft die App **7 Tage**, danach einfach erneut auf Run drücken.

## 3. TestFlight und App Store (Apple Developer Program, 99 €/Jahr)

1. Anmelden unter <https://developer.apple.com/programs/> (Freischaltung dauert 1–2 Tage).
2. In Xcode bei **Team** das bezahlte Team wählen.
3. In <https://appstoreconnect.apple.com> eine neue App anlegen (Name, Bundle-ID `io.github.moritz249.smkfree`, Sprache).
4. In Xcode: Ziel **Any iOS Device** → **Product → Archive** → **Distribute App → App Store Connect**.
5. Nach ca. 15 Minuten erscheint der Build in **TestFlight**. Dort dich selbst als Tester eintragen → TestFlight-App aufs iPhone.
6. Für den Store: Screenshots (6,9" und 6,5" iPhone, optional iPad), Beschreibung DE/EN, Datenschutz-URL
   (`https://moritz249.github.io/smkfree/legal.html`), Altersfreigabe, App-Datenschutz: **„Keine Daten erfasst“**.

## Review-Hinweise (Apple Guidelines)

- **4.2 Minimum Functionality**: Die App hat native Funktionen (lokale Mitteilungen, Haptik, Teilen-Menü,
  Offline-Bundle). Im Review-Text erwähnen.
- **1.4.1 Gesundheit**: Die Hinweise „keine medizinische Beratung“ und die Quellen bleiben im Bon und in `legal.html`.
- **Export Compliance**: `ITSAppUsesNonExemptEncryption = false` ist bereits in `Info.plist` gesetzt.

## Nach jeder Code-Änderung

```bash
npm run sync      # Website -> iOS-Projekt
npx cap open ios  # dann in Xcode Run oder Archive
```

App-Icons und Splash-Screens neu erzeugen (Quelle: `resources/`):

```bash
npx capacitor-assets generate --assetPath resources --ios --android
```
