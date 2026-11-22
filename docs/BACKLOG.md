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
- [ ] **Tagebuch**: Verlangen und Ausrutscher mit einem Tipp erfassen (Auslöser, Stärke, geschafft/ausgerutscht),
      „Deine Auslöser“, Rückfall-Modus. Aktuell Platzhalter.
- [x] ~~Navigation auf dem Bon~~ (ersetzt durch Tab-Leiste): Unten-Werkzeugleiste (SOS, Ziel, Teilen, Mehr) statt 7 Buttons oben; Ändern, Farbe, Gesundheit, Erinnern, Sprache, Zurücksetzen ins „Mehr“-Menü (Apple HIG: Aktionen in eine Toolbar unten).
- [ ] Bon bei „noch nicht aufgehört“: oben statt Nullen „Verbrannt pro Jahr“ zeigen.
- [ ] Erstes Öffnen nach dem Bon: kurzer einmaliger Hinweis auf den Craving-SOS-Knopf.
- [ ] Datum-Eingabe: natives iOS-Datumsrad im Bottom-Sheet statt Browser-Datumsfeld prüfen.
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

- [ ] **Widgets** (Home- und Sperrbildschirm): „Tage rauchfrei“ und „€ gespart“ im Bon-Stil. Braucht
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
