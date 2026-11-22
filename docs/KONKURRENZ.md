# Konkurrenz-Apps – was wir übernehmen, was wir besser machen

Stand: 22.11.2026. Quellen: App-Store-Seiten, eine UI-Analyse (ScreensDesign), Testberichte (siehe unten).
Die Store-Seiten beschreiben die Tab-Leisten nicht. Aussagen zur Navigation sind daher grob und sollten in
den Apps selbst geprüft werden.

## Überblick

| | Smoke Free | Kwit | QuitNow | NichtraucherHelden (DiGA) | **SMKFREE heute** |
|---|---|---|---|---|---|
| Startseite | Zeit, Geld, Zigaretten, Gesundheit | Geld, Lebenszeit, Ziele-Zeitstrahl | Zeit, Zigaretten, Geld, Lebenszeit | Status, Tagebuch | Bon mit Tagen und Geld |
| Craving-Hilfe | Tipps, **Craving-Karte und -Verlauf** | Atmen, Mini-Spiele, Motivationskarten, **Log mit Stärke/Gefühl/Kontext** | (Atemhilfe nur Pro) | Atmen, Videos, Spiele | SOS-Atmen + Wenn-dann-Plan |
| Tagebuch / Ausrutscher | Notizen zu Cravings | Tages-Check-in (Stimmung, Zuversicht), Craving-Log | – | Tagebuch mit Ausrutschern (Vollversion) | **fehlt** |
| Gamification | Abzeichen, „Belohnungen“ vom Gesparten, Missionen (Pro) | Trophäen, Avatar | 80 Meilensteine | – | Meilensteine, Coupons |
| Community | Chat (teure Stufe) | Gruppen, Experten-Chat | Chat, Buddies | Community (Vollversion) | – (bewusst) |
| Konto nötig | Login über Google/Facebook (laut Bewertungen) | E-Mail | Login, Facebook möglich | Registrierung | **nein** |
| Tracking laut Datenschutz-Label | genauer Standort, Gesundheitsdaten für Analyse/Werbung | E-Mail | appübergreifendes Tracking, Werbung | kein Tracking | **nichts** |
| Bezahlmodell | Pro + teure Coaching-Stufe | Abo bis 20,99 €/Monat | Abo + Werbung | Rezept / Kasse | kostenlos |

## Häufige Beschwerden (Chancen für SMKFREE)

1. **Paywalls verstecken Grundfunktionen** (Kwit: Daten nur mit Premium; QuitNow: Chat nur lesbar; Smoke Free:
   „weiter kostenlos“-Knopf versteckt). → SMKFREE: Kernfunktionen bleiben frei, keine versteckten Knöpfe.
2. **Ausrutscher setzt alles auf null** (Kwit-Bewertung: Tipp in der Gruppe, „neu anfangen“, alles weg).
   → Rückfall-Modus mit Verlauf statt Reset – passt genau zur Studienlage (Ausrutscher ≠ Rückfall).
3. **Login-Probleme, Datenverlust bei Updates** (Smoke Free: kein Abmelden; QuitNow: Update löschte Daten).
   → SMKFREE hat kein Konto. Export/Import als Backup wird dadurch wichtiger (steht im Backlog).
4. **Ungenaue Gesundheitsangaben** (QuitNow). → Quellen in `legal.html` sauber halten.
5. **Wer noch nicht aufhören will, wird nicht bedient** (Smoke Free). → SMKFREE kann das schon („noch nicht
   aufgehört“); ausbauen mit festem Rauchstopp-Tag.

## Muster, die wir übernehmen sollten

- **Craving-Log mit einem Tipp** (Kwit, Smoke Free): Stärke, Auslöser, geschafft/ausgerutscht. Daraus „Deine
  Auslöser“ und Verlauf (Smoke Free zeigt eine Craving-Karte – bei uns ohne Standort, nur Auslöser und Uhrzeit).
- **Ablenkung im SOS** (Kwit, NichtraucherHelden): neben Atmen auch Bewegung und eine kurze Ablenkung.
- **Gespartes als Belohnung ausgeben** (Smoke Free „Treats“): passt zum Sparziel; Meilenstein-Coupon
  „Gönn dir etwas für X €“.
- **Widget / Sperrbildschirm** (Smoke Free, QuitNow): steht schon im Backlog, sehr sichtbarer Nutzen.
- **Tages-Check-in** (Kwit): kurz, freiwillig – aber mit neutralen Stimmungen, nicht nur negativen
  (Kritik an Kwit).

## Muster, die wir bewusst nicht übernehmen

- Konto-Pflicht, Login über Facebook/Google, Standort- und Gesundheitsdaten-Tracking.
- Lange Onboardings (Kwit: 27 Schritte, ca. 3,5 Minuten). SMKFREE bleibt bei unter 45 Sekunden bis zum Bon.
- Community-Chat: Moderation, Datenschutz und Server nötig; Bewertungen bei QuitNow eher mäßig.
- Suchtmechaniken aus Social Apps (Endlos-Feeds, Verlustangst bei Streaks, Push-Druck).
- Teure Abos und Coaching-Upsells.

## Was SMKFREE schon besser macht

- **Datenschutz**: kein Konto, kein Server, kein Tracking – deutlicher Unterschied zu Smoke Free und QuitNow.
- **Teilbarer Bon**: hat keine der Apps in dieser Form; eingebauter Wachstumskanal.
- **Studienbasierte Bausteine** gratis: Wenn-dann-Plan (bei anderen nicht gefunden), Coach-Nachrichten, SOS.
- **Schnellster Einstieg** ohne Registrierung.

## Vorschlag Navigation (für die nächste Runde)

```
[ Bon ]  [ Plan ]  [ ● SOS ]  [ Tagebuch ]  [ Mehr ]
```

- Bon: Startseite mit Tagen, Geld, Sparziel, Teilen.
- Plan: Wenn-dann-Plan, später fester Rauchstopp-Tag und Vorbereitung.
- SOS: ganze Seite – Atmen, Bewegung, eigener Plan; danach „Geschafft“ oder „Ausgerutscht“ → Tagebuch.
- Tagebuch: Cravings und Ausrutscher, „Deine Auslöser“, Verlauf (ersetzt den Reset bei Ausrutschern).
- Mehr: Einstellungen (Erinnerungen, Coach, Sprache, Farbe, Entwickler, Zurücksetzen).

## Quellen

- [Smoke Free – App Store](https://apps.apple.com/app/id577767592)
- [Kwit – App Store](https://apps.apple.com/app/id525441365) · [Kwit – UI-Analyse (ScreensDesign)](https://screensdesign.com/showcase/quit-smoking-for-good-kwit) · [JMIR Serious Games 2023 zu Kwit](https://games.jmir.org/2023/1/e39975/PDF)
- [QuitNow – App Store](https://apps.apple.com/us/app/id483994930) · [Healthify NZ – Bewertung QuitNow](https://healthify.nz/apps/q/quit-smoking-quitnow-app)
- [NichtraucherHelden – App Store](https://apps.apple.com/de/app/nichtraucherhelden-de/id1462400864) · [Pharmazeutische Zeitung](https://www.pharmazeutische-zeitung.de/mit-dem-rauchen-aufhoeren-mit-digitaler-unterstuetzung-137255/)
- [Medical News Today – Rauchstopp-Apps](https://www.medicalnewstoday.com/articles/317633.php)
- [Stiftung Warentest – Nichtraucher-Apps im Test (kostenpflichtig, nicht gelesen)](https://www.test.de/nichtraucher-apps-und-programme-im-test-6072606-tabelle/)
