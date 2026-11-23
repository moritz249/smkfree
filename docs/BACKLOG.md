# Backlog

Reihenfolge nach Priorität: Optik → Usability → Funktionen → Monetarisierung.

## Usability

- [x] Bon vereinfacht: große Tage-Zahl statt 5 Zeitzeilen, doppelte Zeilen raus, nur 1 Coupon, QR/Link nur im geteilten Bild.
- [x] „Frühere Ausgaben“ (erweiterter Bon) entfernt. Rechenlogik bleibt in app-core.js, falls sie später wieder gebraucht wird.

- [x] Zurücksetzen mit eigenem Bestätigungs-Sheet (listet auf, was gelöscht wird) statt Browser-Dialog.
- [ ] Optional: Rückgängig nach dem Zurücksetzen, Teil-Reset, eigenes Einstellungs-Sheet.
- [x] **Entwicklermodus**: 7× auf „Version“ im Mehr-Menü tippen. Test-Mitteilungen (Coach, Meilenstein, Geld, Tagesbon) in 10 s.
- [ ] **Rückfall-Modus**: Ausrutscher festhalten statt alles zu löschen (neues Startdatum mit Verlauf).
- [x] **Tab-Leiste** (Bon · Plan · SOS · Tagebuch · Mehr) statt Werkzeugleiste; SOS, Plan und Mehr als ganze Seiten,
      Ziel und Teilen über dem Bon. Ruckelnde Druck-/Slide-Animationen entfernt. Siehe [KONKURRENZ.md](KONKURRENZ.md).
- [x] Usability-Test 1 (Kilian, 22.11.2026): nur „i“ öffnet Infos, Bon nicht mehr direkt bearbeitbar
      (Änderungen über „Mehr → Angaben ändern“), Pinsel statt Farbpunkt, ganze Schachteln, einmaliger Hinweis zum Bon.
- [ ] **Mehrfachauswahl bei der Art** (Wunsch aus Test 1): z. B. Zigaretten + Vape gleichzeitig. Braucht neues
      Datenmodell (`modes: []` statt `mode`), Migration (`STORAGE_VERSION` 5), Konsum-Schritte je Art, Summen auf dem
      Bon, Coach/Mitteilungen und Teilen-Text über alle Arten.
- [x] **Tagebuch**: Verlangen und Ausrutscher mit Stärke (1–5), Auslöser und Notiz. „Deine Auslöser“ (Top 3),
      Tageszeit, letzte 7 Tage, Verlauf mit Löschen. SOS „Geschafft +1“ legt den Eintrag an. Ausrutscher setzen
      nichts zurück.
- [ ] Tagebuch-Ideen: Auslöser im Coach nutzen („Kaffee ist dein häufigster Auslöser …“), Rückfall-Modus mit
      neuem Startdatum bei echtem Rückfall, Export.
- [x] ~~Navigation auf dem Bon~~ (ersetzt durch Tab-Leiste): Unten-Werkzeugleiste (SOS, Ziel, Teilen, Mehr) statt 7 Buttons oben; Ändern, Farbe, Gesundheit, Erinnern, Sprache, Zurücksetzen ins „Mehr“-Menü (Apple HIG: Aktionen in eine Toolbar unten).
- [ ] Bon bei „noch nicht aufgehört“: oben statt Nullen „Verbrannt pro Jahr“ zeigen.
- [ ] Erstes Öffnen nach dem Bon: kurzer einmaliger Hinweis auf den Craving-SOS-Knopf.
- [ ] Datum-Eingabe: natives iOS-Datumsrad im Bottom-Sheet statt Browser-Datumsfeld prüfen.
- [x] **Gesundheit-Tab** (ersetzt „Plan“ in der Tab-Leiste; Plan weiter über Mehr und SOS): 8 Funktionen nach DKFZ-Zeitplan
      mit Prozent bis zum jeweiligen Zeitpunkt, „X von 8 erreicht“, Hilfe-Karte mit Rauchfrei-Telefon (BIÖG) und rauchfrei-info.de.
- [x] Verbrauchsfelder starten mit echten Standardwerten statt grauer Platzhalter (vorher: „Bon drucken“ verlangte trotzdem Eingabe).
- [x] Wichtige Buttons blau (`--action`), ausgewählte Antworten schwarz mit Haken, aktiver Tab blau markiert.
- [x] Entwicklermodus: Schriftart und Textgröße (80–140 %) zum Testen.
- [x] **Tab-Leiste neu** (23.11.2026): Start · Tagebuch · **＋ Eintrag** · Bon · Mehr. SOS ist kein Tab mehr, sondern
      eine Aktion: im ＋-Sheet (SOS, Verlangen widerstanden, Ausgerutscht, Wenn-dann-Plan) und als Karte auf Start.
- [x] **Tages-Check-in** auf Start: „Wie stark war das Verlangen heute?“ (Keins/Leicht/Mittel/Stark), Wochenansicht
      Mo–So, Rückmeldung je nach Stärke (Plan bzw. SOS anbieten), **Tipp des Tages** aus dem Coach. Keine Serie, die
      reißt: ein verpasster Tag bleibt einfach leer.
- [x] **Start = nur Bordcomputer** in Handygröße (Desktop: zentriert). Tasten Reihe 1: Tage/Geld/Leben/Licht, Reihe 2:
      SOS (Warnblink-Dreieck), Heute (Check-in-Sheet, blaue LED bis eingecheckt), Körper (Gesundheit als eigene Seite).
- [x] **SOS vereinfacht** (UX-Faustregeln, W3C COGA): Atemkreis mit Phase und 4-3-2-1, dünne 3-Minuten-Linie, „Geschafft“
      ab Sekunde 1, „Abbrechen“ sichtbar; Zähler und Euro-Wert raus aus dem Moment des Verlangens.
- [x] Neuer-Nutzer-Durchgang: Tag 0 zeigt Stunden statt „0 Tage“, Bon-Hinweis nennt + statt SOS-Tab, Reset hebt Datums-Chip auf.
- [x] Board-Tasten 3+3: „Anzeige ▸“ (Tage/Geld/Leben in einer Taste, auch Tippen aufs Display), Licht, Bon drucken · SOS, Heute, Körper.
- **Entscheidungen 23.11.2026:** Zielgruppe junge Erwachsene (18–35). SOS bleibt nur Atmen. Bon bleibt wichtig, wird vom
  Bordcomputer aus gedruckt. Wiederkommen über: Abend-Erinnerung, Belohnungen, Wochenrückblick (nächste Schritte):
- [x] Abend-Erinnerung „Kurz einchecken?“ um 20 Uhr, entfällt nach dem Check-in (Plan wird neu berechnet). Schalter unter Erinnerungen.
- [x] Belohnungen: Displayfarben ab Tag 1/3/7/14/30 (Orange, Blau, Grün, LCD, Gold); „NEU“ an der Licht-Taste, Hinweis auf die nächste.
- [x] Wochen-Bon: im Heute-Sheet, sonntags ab 18 Uhr einmal automatisch, Mitteilung So 19 Uhr, Teilen als Text.
- [x] Tagebuch vereinfacht: ein „+ Neuer Eintrag“, Sheet mit zwei Dropdowns (Was passiert? · Auslöser), eine Zusammenfassungszeile.
- [ ] Check-in im Coach nutzen (z. B. nach zwei „Stark“-Tagen Plan anbieten) und Tages-Mitteilung „Kurz einchecken?“.
- [ ] Wochenrückblick am Sonntag: Check-ins, Cravings, Gespartes der Woche als kleiner Bon zum Teilen.
- [ ] Usability-Test mit 3–5 Leuten (Ziel: Bon in unter 45 s, ohne Hilfe).

## Daten / Persistenz

Aktueller Stand: Alle Daten liegen nur lokal. Web: `localStorage` des Browsers. App: zusätzlich gespiegelt
in den nativen Preferences (iOS UserDefaults / Android SharedPreferences), damit iOS sie nicht löschen kann.
Verloren gehen sie nur beim Löschen der App bzw. der Browserdaten.

- [ ] **Export / Import** als Datei (JSON) oder Teilen-Link für Gerätewechsel.
- [ ] Optional **iCloud-Sync** (iOS Key-Value Store) bzw. Android Auto Backup prüfen. Bleibt ohne eigenen Server.
- [ ] Wenn Daten von einer zur nächsten Version wechseln: Migration statt Löschen (`STORAGE_VERSION`).

## Teilen / Wachstum

- [x] Persönlicher Teilen-Text mit Zahlen und Frage an Freunde; Meilenstein-Coupon „7 Tage! Teile deinen Bon“.
- [ ] Story-Format 9:16 (Bon zentriert auf Papier-Hintergrund) für Instagram/WhatsApp-Status.
- [ ] „Freund herausfordern“: Link öffnet direkt den Rechner mit der Frage „Was verbrennst du?“.
- [ ] Jahres-Bon / Rückblick zum Jahrestag als besonderer Beleg.
- [ ] Universal Links / App-Store-Link im QR-Code, sobald die App im Store ist.

## Funktionen

Evidenz und Ideen aus Studien: [EVIDENZ.md](EVIDENZ.md).

- [x] **Wenn-dann-Plan**: bis zu 3 Auslöser mit Ersatzhandlung („Mehr“-Menü und SOS), wird im SOS angezeigt.
- [x] **Rauchfrei-Coach**: lokale Push-Tipps (Woche 1 zweimal täglich, dann seltener bis Woche 12), nutzt den Wenn-dann-Plan.
      Schalter unter „Erinnern“, standardmäßig an. Plant immer die nächsten 14 Tage, neu bei jedem App-Start.
- [ ] Quellen für die Coach-Aussagen (Medikamente verdoppeln Chancen, Rückfälle in den ersten Tagen) in `legal.html` ergänzen.
- [ ] SOS: Option „5 Min. bewegen“; „Mehr Hilfe“-Karte (Medikamente, Rauchfrei-Telefon).

- [x] **Start-Tab** (erster Tab, öffnet beim App-Start): Bordcomputer im App-Stil (Papier, 1px-Linien, harter Schatten), darunter
      Gesundheit (ersetzt den eigenen Gesundheit-Tab). Display-Farben: Bon (folgt der Bon-Farbe), Orange, Blau, LCD.
- [x] **Bordcomputer** (Stil: 90er-Auto-Display): Tage, Gespartes, Lebenszeit zurück (nur Zigaretten;
      Selbstgedrehte/Vape zeigen Stück/ml). Tasten Tage/Geld/Leben tauschen das große Display, „Licht“ wechselt
      Bon/Orange/Blau/LCD. Daten aus `boardData()` in app-core.js, Farben als `--obc-*`-Tokens: beides Vorlage fürs Widget.
- [ ] **Widgets** (Home- und Sperrbildschirm) im Bordcomputer-Stil: „Tage rauchfrei“ und „€ gespart“. Braucht
      eine native WidgetKit-Erweiterung (Swift) auf dem Mac bzw. ein Android-App-Widget.
- [ ] **Bon-Archiv**: monatlicher Bon zum Durchblättern und Sammeln.
- [ ] Face-ID-/PIN-Sperre (optional).
- [ ] Weitere Sprachen: neues Wörterbuch in `i18n.js` hinzufügen (Tests prüfen Vollständigkeit).
- [ ] `legal.html` und Store-Texte auf Deutsch.
- [ ] Apple Health: Achtsamkeitsminuten aus der Atemübung (optional).

## Monetarisierung (unaufdringlich, werbefrei)

- [ ] **SMKFREE Pro** als einmaliger Kauf: Widgets, eigene Farben, Bon-Archiv, Export.
- [ ] **Trinkgeld-Kasse** im Bon-Stil („Gib einen Kaffee aus, den du nicht verraucht hast“).
- [ ] Umsetzung mit StoreKit / Google Play Billing, z. B. über RevenueCat oder ein Capacitor-Kauf-Plugin.
      Voraussetzung: Apple Developer Account.
- [ ] Kauf-Hinweis nie im Assistenten, frühestens nach dem 3. Öffnen und nur einmal.

## Technik

- [ ] GitHub Actions: Tests bei jedem Push; optional Android-Build in der Cloud.
- [ ] GitHub Pages auf den neuen Stand bringen (Website = PWA bleibt parallel bestehen).
- [ ] Icon als echte Vektorgrafik (statt Schrift im SVG), damit es auf jedem Rechner gleich gerendert wird.
