# Backlog

Stand: 27.11.2026. Reihenfolge innerhalb der Abschnitte nach Priorität. Hier anfangen: **„Als Nächstes“**.

Zielgruppe junge Erwachsene (18–35), auch ADHS: wenig Text, eine Aufgabe pro Bildschirm, klare große Flächen.
UI-Regeln: [UI-RICHTLINIEN.md](UI-RICHTLINIEN.md). Evidenz: [EVIDENZ.md](EVIDENZ.md). Konkurrenz: [KONKURRENZ.md](KONKURRENZ.md).

## Als Nächstes

- [ ] **Graphen auf Start.** 1 und 2 erledigt 27.11. (siehe unten), auf dem Gerät ansehen. Offen:
      3. Überstanden vs. geraucht pro Woche.
      4. ~~Gespartes Geld als Linie mit Sparziel-Markierung~~ erledigt 27.11. im Blatt hinter „Gespart“.
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

## Erledigt am 27.11.2026

- Tacho antippen → Blatt „Rauchfrei“: Jahre/Monate/Tage, Tage/Stunden/Minuten/Sekunden live, Monatsraster, nächstes Ziel mit Datum.
- „Gespart“ antippen → Blatt mit Sparkurve bis zum Ziel, Prozent, „Noch offen“, Datum der Erreichung (Prognose), „Ziel ändern“.
- SOS-Kachel heißt wieder „SOS: Gerade starkes Verlangen“.
- Tagebuch: „+ Neuer Eintrag“ unten neben dem +, Zeile „Letzte 7 Tage …“ entfernt.
- Hilfe-Karte (Gesundheit): mehr Abstand, Anruf-Button einzeilig („Rauchfrei-Telefon anrufen“).
- Start, Graph „Verlangen“: Suchtprotokoll als Balken in Ampelfarben, Woche (Mo–So) / Monat (letzte 30 Tage),
  „Im Schnitt: …“ und „x von y Tagen eingetragen“. Die Mini-Balken in der Suchtprotokoll-Zeile sind dafür weg.
  Woche/Monat wird nicht gespeichert (kein neuer Schlüssel), beim Start immer Woche.
- Start, Graph „Wann und warum“: Tagebuch der letzten 30 Tage nach Tageszeit (häufigste in Akzentfarbe) und
  die drei häufigsten Auslöser; Antippen öffnet das Tagebuch.
- Englische Texte angeglichen: „Money saved“, „Life gained“, „Cravings got through“ / „Got through“,
  „Thanks for taking care of yourself.“ Suchtprotokoll heißt auf Englisch **„Craving log“** (Entscheidung Moritz 27.11.):
  „Fill in craving log“, „Craving log · today Mild“, Erinnerung „Craving log in the evening“. Dabei auch deutsch
  angepasst: „Suchtprotokoll am Abend“, „Suchtprotokoll für heute?“, Bon-Zeile „GEWONNENE LEBENSZEIT*“.
  Ungenutzte alte Schlüssel (Wochen-Bon) bleiben für das Aufräumen in `i18n.js`.

## Design und Bedienung

- [ ] Name „Mint“ prüfen: das Design ist seit 24.11. graublau (#96b1bd). Vorschlag „Nebel“.
- [ ] Begriff „Suchtprotokoll“ für den täglichen Check bestätigen (seit 24.11., vorher „Tages-Check“).
- [ ] Optional: Noto-Emoji-3D-Sticker statt 2D; weitere Sticker, Schriften und Bon-Hintergründe als Belohnung.
- [ ] Mehr Designs nach Wunsch (gleiches Muster wie Dracula: nur Variablen für hell und dunkel).
- [ ] **Startseite modular (Wunsch Moritz 27.11., größerer Umbau, später):** mehr Kacheln mit sinnvollen Infos
      (z. B. nicht gerauchte Zigaretten, Verlangen diese Woche, häufigster Auslöser, nächster Meilenstein),
      Karten ein-/ausblenden und per Ziehen sortieren, Auswahl und Reihenfolge lokal speichern (neuer Schlüssel in
      `MIRRORED_KEYS` und `resetApp()`).
- [ ] **Mehrfachauswahl bei der Art** (Zigaretten + Vape): neues Datenmodell `modes: []`, Migration (`STORAGE_VERSION` 5).
- [ ] **Rückfall-Modus:** bei echtem Rückfall neues Startdatum mit Verlauf statt alles zu löschen
      (Ergänzungen siehe „Inhalte aus rauchfrei-info.de“).
- [ ] Optional: Rückgängig nach dem Zurücksetzen, Teil-Reset.
- [ ] Tagebuch: Auslöser im Coach nutzen („Kaffee ist dein häufigster Auslöser …“), Export.
- [ ] Suchtprotokoll im Coach nutzen (nach zwei „Stark“-Tagen Plan anbieten).
- [ ] SOS: Option „5 Min. bewegen“; „Mehr Hilfe“-Karte. Quellen für Coach-Aussagen in `legal.html`.
- [ ] Usability-Test mit 3–5 Leuten (Ziel: Bon in unter 45 s ohne Hilfe).

## Inhalte aus rauchfrei-info.de (BIÖG, gesichtet 27.11.2026)

Vor dem Einbau Quellen in `legal.html` ergänzen; Seiten sind auf 2025 datiert.

- [ ] **Notfallplan mit eigenen Gründen:** 3–5 Strategien nach Vorlage („Ich lenke mich ab mit …“, „Ich rufe … an“,
      „Ich gehe sofort weg“, „Meine Gründe: …“). Mit dem Wenn-dann-Plan (EVIDENZ P1) zusammenlegen; die eigenen
      Gründe im SOS nach dem Atmen zeigen. Quelle: /tipps/tipps-bei-verlangensattacken/.
- [ ] **Die „vier A“** (Aufschieben, Ausweichen, Abhauen, Ablenken) als Grundlage für eine zweite SOS-Option und
      für Coach-Texte.
- [ ] **Spätes Verlangen:** Text für spätere Meilensteine: Verlangen kann nach Wochen/Monaten kommen (Orte,
      Jahreszeit, Urlaub, Feiern), es ist nur ein Impuls, kein Rückfall.
- [ ] **Infokarte Gewicht:** ca. 80 % nehmen zu, im Schnitt 4,5 kg; Stoffwechsel ca. 200 kcal/Tag weniger. Rat:
      ein paar Kilo erlauben, Liste leichter Snacks. Frust übers Gewicht ist ein häufiger Rückfallgrund.
      Quellen: DKFZ 2011, American Heart Association 2019. Quelle: /tipps/gesund-ernaehren/.
- [ ] **Alkohol** in den ersten Wochen meiden: als Auslöser im Wenn-dann-Plan bzw. Coach.
- [ ] **Rückfall-Modus ergänzen:** Ausrutscher (einmalig) vs. Rückfall (alte Muster) trennen; nach Rückfall Ursache
      ansehen und **neuen Rauchstopp-Tag** wählen. Quelle: /tipps/nicht-ganz-geschafft/.
- [ ] **Wunschzettel:** Belohnungen nach X Wochen vom Gesparten (passt zu EVIDENZ P3 Nr. 8 und zum Sparziel).
- [ ] **„Mehr Hilfe“-Karte ergänzen:** rauchfrei-Chat dienstags 20–22 Uhr, Forum mit Lotsen, Telefonberatung ruft
      bis zu 5× zurück (proaktive Beratung). Nummer und Zeiten (0800 8 31 31 31, Mo–Do 10–22, Fr–So 10–18) stimmen
      mit der App überein.
- [ ] **Gesundheits-Zeitleiste prüfen:** App sagt „5 Jahre: halbes Risiko Herzkrankheit und Schlaganfall“ und
      „15 Jahre: halbes COPD-Risiko“; rauchfrei-info sagt 5–10 Jahre Schlaganfallrisiko sinkt, 15 Jahre
      Herzkrankheit fast wie bei Nichtrauchenden (Quellen: ACS 2018, Tabakatlas 2025, Mons et al. 2018). Mit der
      Quelle in `legal.html` abgleichen. Quelle: /der-rauchstopp/vorteile/gesundheit/.
- Bewusst nicht: Fagerström-Test (zu viel Text für die Zielgruppe), Ersparnisrechner (App hat ihn schon).

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
