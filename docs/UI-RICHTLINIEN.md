# UI-Richtlinien SMKFREE

Ziel: Jeder Bildschirm sieht aus wie aus einem Guss. Zielgruppe sind junge Erwachsene mit wenig Geduld (auch ADHS): wenig Text, eine Aufgabe pro Bildschirm, klare große Tipp-Flächen.

Die Werte hier sind in `ios.css` als Variablen umgesetzt (`--radius-*`, `--ios-*`, `--action*`, `--craving-*`, `--sos`). Neue Elemente nutzen diese Variablen, keine eigenen Werte.

## 1. Grundsätze

1. **Eine Aufgabe pro Bildschirm.** Was nicht zur Aufgabe gehört, kommt in ein Blatt (Sheet) oder auf eine eigene Seite.
2. **Kurz.** Überschrift höchstens eine Zeile, Erklärung höchstens ein Satz. Du-Form, keine Fachwörter.
3. **Ehrlich und freundlich.** Rauchen wird nie bestraft („Ich habe geraucht“, „Dein Zähler läuft weiter“), keine Serien, die reißen.
4. **Gesundheitszahlen immer mit Quelle oder Hinweis** („Schätzung, keine medizinische Beratung“), siehe `legal.html`.

## 2. Abstände

| Stufe | Wert | Wofür |
|---|---|---|
| xs | 4 px | Icon zu Text in einer Zeile |
| s | 8 px | Elemente in einer Gruppe (Chips, Buttons nebeneinander) |
| m | 12 px | Karten untereinander, Abstand in Listen |
| l | 16 px | Seitenrand links/rechts, Innenabstand von Karten |
| xl | 20 px | Abstand zwischen Abschnitten einer Seite |
| xxl | 24 px | Abstand unter der großen Überschrift |

Seitenrand ist immer **16 px**. Karten haben innen **14–16 px**.

## 3. Ecken

| Element | Radius | Variable |
|---|---|---|
| Karten, Listen, Bon | 12 px | `--radius-card` |
| Kacheln (SOS, Bon, Design) | 14 px | `--radius-tile` |
| Buttons, Eingabefelder, Auswahl, Plus/Minus | 12 px | `--radius-button` |
| Chips, kleine Auswahlflächen | 10 px | – |
| Blätter von unten (oben) | 18 px | `--radius-sheet` |
| Tab-Leiste | 22 px | – |

**Rund (50 %) nur für:** den +-Button in der Tab-Leiste, Icon-Kreise, Farbpunkte, Info-Button „i“. Sonst nichts Rundes, auch keine runden Plus/Minus-Knöpfe.

## 4. Schrift

Systemschrift (auf dem iPhone SF Pro) überall. Ausnahme: das Logo „smkfree“ und die Bon-Schrift, die der Nutzer wählt.

| Rolle | Größe | Gewicht |
|---|---|---|
| Große Seitenüberschrift | 34 px (2.125rem) | 700 |
| Überschrift im Blatt | 26 px (1.6rem) | 700 |
| Kleine Überschrift über Abschnitten | 13 px, GROSS | 600, grau |
| Fließtext, Listenzeilen | 17 px (1.0625rem) | 400–500 |
| Hinweistext | 13–15 px | 400, grau |
| Zahlen groß (Tacho, Karten) | nach Platz | 700, Einheit 58 % klein und grau |

Zahlen mit Einheit: **Zahl groß, Einheit klein** („104 Tage“, „665,99 €“), wie in Apple Health.

## 5. Farben

- **Hintergrund, Karten, Text:** nur über die Variablen `--ios-bg`, `--ios-card`, `--ios-label`, `--ios-secondary`. Dann funktionieren Hell, Dunkel und alle Designs automatisch.
- **Akzent** (`--action`): Buttons, Links, aktive Tabs, Fortschrittsbalken. Text auf Akzentflächen: `--action-ink`.
- **Feste Bedeutungsfarben, in jedem Design gleich:**
  - SOS: Dunkelrot `--sos`
  - Verlangen als Ampel: Keins grün, Leicht gelb, Mittel orange, Stark rot (`--craving-0` bis `--craving-3`)
  - Erreicht/erledigt: Grün `--ios-green`
  - Löschen/Gefahr: Rot `--ios-red`
- **Kontrast:** Text mindestens 4,5 : 1. Auf hellen Akzentflächen dunkle Schrift.
- **Designs der App:** Standard, Mint (Graublau #96b1bd), Lavendel, Dracula (dunkel: Dracula Classic, hell: Alucard). Neue Designs definieren nur die Variablen, hell und dunkel.
- **Der Bon ist getrennt vom App-Design:** eigene Farbe, eigener Hintergrund, eigene Schrift, Sticker (Noto Emoji).

## 6. Bausteine

### Buttons
- **Primär:** volle Breite, 50 px hoch, Akzentfarbe, eine pro Bildschirm/Blatt.
- **Sekundär:** gleiche Größe, Fläche `--ios-fill`, Schrift in Akzentfarbe.
- **Textbutton** nur für „‹ Zurück“ und kleine Nebenaktionen.
- Im Blatt stehen Buttons unten: links Sekundär (Abbrechen), rechts Primär (Speichern).

### Eingabefelder und Auswahl
- 50–52 px hoch, Radius 12 px, Fläche `--ios-fill`, Text links.
- Beschriftung darüber, klein und grau.
- Plus/Minus neben Zahlen: **quadratisch 52 × 52 px, Radius 12 px**, Zeichen „−“ und „+“.
- Beim Antippen eines gefüllten Feldes wird der Inhalt markiert.

### Listen (Einstellungen, Bon anpassen)
- Zeile: Icon links (22 px), Text, Wert grau rechts, „›“ wenn es weitergeht.
- Auswahl mit wenigen Optionen (Farbe, Schrift, Hintergrund, Sticker): klappt unter der Zeile auf, immer nur eine offen.
- Lange Auswahllisten (Sprache, Währung): eigenes Blatt mit Häkchen.

### Karten und Kacheln
- Karte: Titel klein grau mit „›“, darunter der Wert groß, darunter ein Balken oder eine Zeile Erklärung.
- Kacheln auf Start: Icon im Kreis oben, Titel, eine kurze Zeile.

### Blätter (Sheets)
- Griff oben, Überschrift, höchstens ein Satz Erklärung, Inhalt, Buttons unten.
- Schließen durch Wischen nach unten, durch „Abbrechen/Fertig“ und durch „Zurück“-Geste.

### Seiten
- **„‹ Zurück“ immer oben links**, auf jeder Seite, auf die man wechselt.
- Große Überschrift oben, darunter der Inhalt. Tabs haben kein Zurück.

## 7. Bewegung und Vibration
- Übergänge 120–260 ms, nichts Hüpfendes.
- Vibration nur bei Momenten, die zählen: geschafft, gespeichert, neuer Atemzug im SOS. Nicht bei jedem Tipp.

## 8. Checkliste für neue Bildschirme
- [ ] Nur Variablen für Farben, Ecken und Abstände benutzt
- [ ] Hell, Dunkel und alle drei Designs geprüft
- [ ] „‹ Zurück“ oben links (falls Unterseite)
- [ ] Ein Primär-Button, volle Breite
- [ ] Texte kurz, auf Deutsch und Englisch in `i18n.js`
- [ ] Bei 375 px Breite nichts abgeschnitten
