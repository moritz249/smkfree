# Backlog

Reihenfolge nach Priorität: Optik → Usability → Funktionen → Monetarisierung.

## Usability

- [ ] **Zurücksetzen überdenken**: Ändern geht jederzeit über „Ändern“. Zurücksetzen in ein kleines
      Einstellungs-Menü verschieben (zusammen mit Sprache, Export, Erinnerungen) statt im Assistenten-Kopf.
- [ ] **Rückfall-Modus**: Ausrutscher festhalten statt alles zu löschen (neues Startdatum mit Verlauf).
- [x] **Navigation auf dem Bon**: Unten-Werkzeugleiste (SOS, Ziel, Teilen, Mehr) statt 7 Buttons oben; Ändern, Farbe, Gesundheit, Erinnern, Sprache, Zurücksetzen ins „Mehr“-Menü (Apple HIG: Aktionen in eine Toolbar unten).
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

## Funktionen

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
