# Android: App bauen und testen (geht auch unter Windows)

Das Android-Projekt liegt fertig unter `android/`.

## 1. Einrichten (einmalig)

1. **Android Studio** installieren: <https://developer.android.com/studio> (bringt JDK und Android SDK mit).
2. Im Projektordner:

   ```bash
   npm install
   npm run sync:android
   npx cap open android
   ```

## 2. Auf dem eigenen Android-Handy testen (kostenlos)

1. Am Handy: **Einstellungen → Über das Telefon → 7× auf „Build-Nummer“ tippen** → Entwickleroptionen →
   **USB-Debugging** an.
2. Handy per USB anschließen, in Android Studio oben auswählen, **▶ Run**.
   Alternativ den eingebauten Emulator (Device Manager) nutzen.

## 3. Google Play (einmalig 25 $)

1. Konto anlegen: <https://play.google.com/console>
2. Android Studio → **Build → Generate Signed App Bundle** → neuen Keystore anlegen.
   **Keystore und Passwort sicher aufbewahren**: Ohne ihn sind keine Updates möglich.
3. In der Play Console App anlegen → zuerst **Interner Test**, dann Produktion.
4. Datensicherheit: **„Keine Daten erfasst oder geteilt“**. Datenschutz-URL wie bei iOS.

Neue Entwicklerkonten müssen vor der Veröffentlichung einen geschlossenen Test mit Testern durchlaufen
(aktuelle Regeln in der Play Console prüfen).
