# Backlog

Stand: 24.11.2026. Reihenfolge innerhalb der Abschnitte nach Priorität. Hier anfangen: **„Als Nächstes“**.

Zielgruppe junge Erwachsene (18–35), auch ADHS: wenig Text, eine Aufgabe pro Bildschirm, klare große Flächen.
UI-Regeln: [UI-RICHTLINIEN.md](UI-RICHTLINIEN.md). Evidenz: [EVIDENZ.md](EVIDENZ.md). Konkurrenz: [KONKURRENZ.md](KONKURRENZ.md).

## Als Nächstes

- [ ] **Graphen auf Start.** Vorschlag (noch nicht entschieden, mit 1 und 2 anfangen):
      1. Verlangen-Verlauf aus dem Suchtprotokoll: Balken in Ampelfarben, umschaltbar Woche/Monat wie Apple Health.
      2. „Wann und warum“: Tageszeit des Verlangens und häufigste Auslöser aus dem Tagebuch (hilft beim Wenn-dann-Plan).
      3. Überstanden vs. geraucht pro Woche.
      4. Gespartes Geld als Linie mit Sparziel-Markierung (sagt wenig Neues, eher zuletzt).
- [ ] **Englische Texte angleichen** an die neue deutsche Wortwahl (24.11.): „Money saved“ statt „not burned“,
      „Life gained“ statt „life back“, „Cravings got through“, Dank-Satz „Thanks for taking care of yourself“,
      Name des Suchtprotokolls auf Englisch klären. Englische Schlüssel in `app.js`/`index.html` und `i18n.js` ändern.
- [ ] **Auf echten Geräten testen:** Teilen in WhatsApp und iMessage (kurzer Bon 5:4, ganzer Bon, nur Link),
      Wischen vom linken Rand in der App, Vibrationen, Sticker im Teilen-Bild. iOS-App wurde noch nie gebaut (braucht Mac).
- [ ] **Link-Vorschau der Webseite** (`assets/share-card.png`, og:image) neu machen: zeigt noch alte englische
      Beispielzahlen (422 Tage), wirkt bei „Nur die App teilen“ wie die Zahlen des Absenders. Neues Bild ohne Zahlen.

## Vor dem App Store (Apple-Richtlinien geprüft am 23.11.2026)

- [ ] **Entwickler-Menü** (7× auf „Version“) im iOS-Release ausblenden oder in den Prüfer-Notizen beschreiben
      (Richtlinie 2.5.19: keine versteckten Funktionen).
- [ ] **Support-Kontakt** in der App und als Support-URL (1.5): E-Mail oder Seite festlegen, bisher nur GitHub-Profil.
- [ ] App Store Connect: Altersfreigabe mit Tabak-Bezug ehrlich angeben; in iOS-Texten Android nicht erwähnen;
      Screenshots aus `docs/screenshots` (`npm run screenshots`).
- [ ] Bereits erfüllt: Quellen und Hinweis „Ärztin/Arzt fragen“ (1.4.1), Datenschutzseite DE/EN mit Löschen (5.1.1),
      keine Daten nach außen, Teilen über System-Sheet, Noto-Emoji-Lizenz unter „Bildquellen“.

## Design und Bedienung

- [ ] Name „Mint“ prüfen: das Design ist seit 24.11. graublau (#96b1bd). Vorschlag „Nebel“.
- [ ] Begriff „Suchtprotokoll“ für den täglichen Check bestätigen (seit 24.11., vorher „Tages-Check“).
- [ ] Optional: Noto-Emoji-3D-Sticker statt 2D; weitere Sticker, Schriften und Bon-Hintergründe als Belohnung.
- [ ] Mehr Designs nach Wunsch (gleiches Muster wie Dracula: nur Variablen für hell und dunkel).
- [ ] **Startseite modular:** Karten ein-/ausblenden und per Ziehen sortieren, Reihenfolge lokal speichern.
- [ ] **Mehrfachauswahl bei der Art** (Zigaretten + Vape): neues Datenmodell `modes: []`, Migration (`STORAGE_VERSION` 5).
- [ ] **Rückfall-Modus:** bei echtem Rückfall neues Startdatum mit Verlauf statt alles zu löschen.
- [ ] Optional: Rückgängig nach dem Zurücksetzen, Teil-Reset.
- [ ] Tagebuch: Auslöser im Coach nutzen („Kaffee ist dein häufigster Auslöser …“), Export.
- [ ] Suchtprotokoll im Coach nutzen (nach zwei „Stark“-Tagen Plan anbieten).
- [ ] SOS: Option „5 Min. bewegen“; „Mehr Hilfe“-Karte. Quellen für Coach-Aussagen in `legal.html`.
- [ ] Usability-Test mit 3–5 Leuten (Ziel: Bon in unter 45 s ohne Hilfe).

## Aufräumen im Code

- [ ] `ios.css` ist durch viele Runden gewachsen (Regeln am Ende überschreiben frühere). Zusammenführen, doppelte
      Regeln entfernen, dabei mit `npm run screenshots` vorher/nachher vergleichen.
- [ ] Alten Bordcomputer-Code entfernen (`.obc`, `renderBoard`, `boardThemeStatus`-Paletten, `#board`), wird nicht mehr angezeigt.
- [ ] Wochen-Bon-Reste entfernen (`weekSummary`, Texte, alte `weekly`-Erinnerung): Funktion wurde am 23.11. gestrichen.
- [ ] Ungenutzte Übersetzungen in `i18n.js` aufräumen.

## Daten / Persistenz

Alle Daten liegen nur lokal (Web: `localStorage`; App zusätzlich native Preferences). Neue Schlüssel immer in
`MIRRORED_KEYS` (`native.js`) und in die Liste in `resetApp()` (`app.js`) eintragen.

- [ ] **Export / Import** als Datei (JSON) für Gerätewechsel.
- [ ] Optional iCloud-Key-Value-Sync bzw. Android Auto Backup prüfen (ohne eigenen Server).
- [ ] Bei Datenänderungen Migration statt Löschen (`STORAGE_VERSION`).

## Teilen / Wachstum

- [ ] Story-Format 9:16 für Instagram/WhatsApp-Status.
- [ ] „Freund herausfordern“: Link öffnet den Rechner mit „Was verbrennst du?“.
- [ ] Jahres-Bon zum Jahrestag; Bon-Archiv (monatlich).
- [ ] Universal Links / App-Store-Link im QR-Code, sobald die App im Store ist.

## Funktionen später

- [ ] **Widgets** (Home/Sperrbildschirm): „Tage rauchfrei“, „€ gespart“. Braucht WidgetKit (Swift, Mac) bzw. Android-Widget.
- [ ] Face-ID-/PIN-Sperre (optional).
- [ ] Weitere Sprachen: neues Wörterbuch in `i18n.js` (erscheint automatisch in der Sprachliste; Tests prüfen Vollständigkeit).
- [ ] Apple Health: Achtsamkeitsminuten aus der Atemübung (optional).

## Monetarisierung (unaufdringlich, werbefrei)

- [ ] SMKFREE Pro als Einmalkauf (Widgets, Bon-Archiv, Export, Extra-Sticker); Trinkgeld-Kasse im Bon-Stil.
- [ ] StoreKit / Google Play Billing (z. B. RevenueCat). Kauf-Hinweis frühestens nach dem 3. Öffnen, nur einmal.

## Technik

- [ ] GitHub Actions: Tests bei jedem Push; optional Android-Build in der Cloud.
- [ ] Icon als echte Vektorgrafik.
- [ ] Nächste Android-Test-APK: `versionCode` 11 (zuletzt installiert: 10 auf dem Galaxy S10e). APK nur auf Ansage bauen.

## Erledigt (Überblick)

- **23.11.:** Atemübung zuverlässig (zeitbasiert), Suchtprotokoll ohne Tipp/Wochen-Bon, „Gewonnene Lebenszeit“-Infoblatt,
  klares +-Menü, Tagebuch mit Notiz und Datum, Wischen-zurück, Statusleisten-Fix, Apple-Richtlinien geprüft,
  Screenshots + Collage (`npm run screenshots`).
- **24.11.:** Ampelfarben fürs Verlangen, Werte im Apple-Health-Stil, weniger Vibration, Onboarding (Schritt 2 mit Weiter,
  Felder markieren beim Antippen), Teilen-Blatt (kurzer Bon / ganzer Bon / nur App, erst wählen dann teilen),
  zuverlässige Updates (Netzwerk zuerst, Update-Hinweis, einmaliger Neustart für alte Installationen),
  Designs Standard/Mint/Lavendel/Dracula mit Hell/Dunkel im Design-Blatt, Bon anpassen (Farbe, Hintergrund, Schrift,
  Noto-Sticker, freischaltbar), Einstellungen-Tab mit Währung und Sprachliste, Zurück oben links überall,
  Rechtliches und Installieren auf Deutsch, Tab-Leiste volle Breite mit schwebendem +, ruhige „Gerade Verlangen?“-Kachel,
  Tacho „54 Jahre“ mit Ziel und Datum (Kalenderjahre), neue Wortwahl (Geld gespart, Gewonnene Lebenszeit, Suchtprotokoll),
  UI-Richtlinien.
- **24.11. (spät):** Design-Auswahl als 4. Schritt beim ersten Start (Hell/Dunkel + Design, nicht unter „Angaben ändern“);
  jedes Design bringt einen passenden Bon mit (Farbe, Hintergrund), änderbar unter „Bon anpassen“.
- Ältere Punkte: siehe Git-Historie.
