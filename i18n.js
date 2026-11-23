// Lightweight i18n without a build step.
// The English text is the key: t("Quit date") returns the translation for the active
// language, or the English text itself. Adding a language = adding one dictionary below.
// HTML elements opt in with data-i18n (text), data-i18n-placeholder and data-i18n-aria.

const LANGUAGE_KEY = "smkfree-language";

export const languages = {
  en: { label: "EN", intl: "en-US", name: "English" },
  de: { label: "DE", intl: "de-DE", name: "Deutsch" },
};

const dictionaries = {
  de: {
    // Wizard
    "30 seconds": "30 Sekunden",
    "No account": "Kein Konto",
    "On your device": "Nur auf deinem Gerät",
    "Your consumption": "Dein Konsum",
    "How much do you smoke?": "Wie viel rauchst du?",
    "How much do you roll?": "Wie viel drehst du?",
    "How much do you vape?": "Wie viel vapst du?",
    "Tobacco, papers & filter per week": "Tabak, Papers & Filter pro Woche",
    "Coils, pods & gear per month": "Coils, Pods & Zubehör pro Monat",
    "{n} per pack · {currency} · change": "{n} pro Schachtel · {currency} · ändern",
    "Currency: {currency} · change": "Währung: {currency} · ändern",
    "Takes about 30 seconds": "Dauert etwa 30 Sekunden",
    "No account, no tracking": "Kein Konto, kein Tracking",
    "Data stays on your device": "Daten bleiben auf deinem Gerät",
    "Quick pick": "Schnellauswahl",
    "Today": "Heute",
    "Yesterday": "Gestern",
    "1 week ago": "Vor 1 Woche",
    "1 month ago": "Vor 1 Monat",
    "Or pick a date": "Oder Datum wählen",
    "See what smoking costs you right now.": "Sieh, was dich das Rauchen gerade kostet.",
    "Your pack": "Deine Schachtel",
    "Your costs": "Deine Kosten",
    "What does vaping cost you?": "Was kostet dich das Vapen?",
    "Ready to print?": "Bereit zum Drucken?",
    "Print my receipt": "Bon drucken",
    "Habit": "Gewohnheit",
    "Not burned so far": "Bisher nicht verbrannt",
    "Costs you per year": "Kostet dich pro Jahr",
    "Costs you per month": "Kostet dich pro Monat",
    "~{s} sec left": "~{s} s",
    "Reset": "Zurücksetzen",
    "Step {n} of {total}": "Schritt {n} von {total}",
    "Quit receipt": "Rauchfrei-Bon",
    "Your progress printed.": "Dein Fortschritt, gedruckt.",
    "Start date": "Startdatum",
    "When did you stop?": "Wann hast du aufgehört?",
    "Pick your quit date, or check the box if you still smoke.": "Wähle dein Rauchstopp-Datum oder setz den Haken, falls du noch rauchst.",
    "Quit date": "Rauchstopp",
    "Please enter a quit date.": "Bitte gib ein Datum ein.",
    "I did not stop yet": "Ich habe noch nicht aufgehört",
    "Your habit": "Deine Gewohnheit",
    "What are you quitting?": "Womit hörst du auf?",
    "Cigarettes": "Zigaretten",
    "Packs of cigarettes": "Zigarettenschachteln",
    "Roll-your-own": "Selbstgedrehte",
    "Tobacco, papers & filter": "Tabak, Papers & Filter",
    "Vaping": "Vapen",
    "Liquid & accessories": "Liquid & Zubehör",
    "Daily habit": "Täglicher Konsum",
    "How many cigarettes per day?": "Wie viele Zigaretten pro Tag?",
    "Cigarettes per day": "Zigaretten pro Tag",
    "Pack size": "Schachtelgröße",
    "How many cigarettes per pack?": "Wie viele Zigaretten pro Schachtel?",
    "Cigarettes per pack": "Zigaretten pro Schachtel",
    "Pack price": "Schachtelpreis",
    "How much does one pack cost?": "Was kostet eine Schachtel?",
    "Price per pack": "Preis pro Schachtel",
    "Currency": "Währung",
    "How many roll-ups per day?": "Wie viele Selbstgedrehte pro Tag?",
    "Roll-ups per day": "Selbstgedrehte pro Tag",
    "Weekly spend": "Wöchentliche Ausgaben",
    "Weekly cost for tobacco, papers & filter?": "Wöchentliche Kosten für Tabak, Papers & Filter?",
    "Total per week": "Summe pro Woche",
    "Usage": "Verbrauch",
    "How much did you vape per week?": "Wie viel hast du pro Woche gevapt?",
    "ml per week": "ml pro Woche",
    "Liquid cost": "Liquid-Kosten",
    "How much does 10ml cost?": "Was kosten 10 ml?",
    "Cost per 10ml": "Preis pro 10 ml",
    "Accessories": "Zubehör",
    "Monthly spend on coils, pods & gear?": "Monatliche Ausgaben für Coils, Pods & Zubehör?",
    "Accessories per month": "Zubehör pro Monat",
    "Summary": "Übersicht",
    "Check your details": "Prüfe deine Angaben",
    "Advanced receipt": "Erweiterter Bon",
    "Estimate what you paid before quitting.": "Schätzt, was du vor dem Aufhören bezahlt hast.",
    "Smoking start date": "Rauchbeginn",
    "Back": "Zurück",
    "Next": "Weiter",
    "Start": "Los",
    "Show receipt": "Bon drucken",
    "Enter a start date before your quit date.": "Der Rauchbeginn muss vor dem Rauchstopp liegen.",
    "Enter a valid amount.": "Bitte gib einen gültigen Betrag ein.",
    "Decrease": "Weniger",
    "Increase": "Mehr",
    "Language": "Sprache",

    // Receipt actions
    "SOS": "SOS",
    "More": "Mehr",
    "Menu": "Menü",
    "Your receipt": "Dein Bon",
    "Edit details": "Angaben ändern",
    "Receipt color": "Bon-Farbe",
    "Health benefits": "Gesundheits-Vorteile",
    "Reset all data": "Alle Daten löschen",
    "On": "An",
    "Off": "Aus",
    "Edit": "Ändern",
    "Share": "Teilen",
    "Preparing": "Moment",
    "Shared": "Geteilt",
    "Downloaded": "Gespeichert",
    "Share failed": "Fehler",
    "Color": "Farbe",
    "Benefits": "Gesundheit",
    "Craving SOS": "Craving-SOS",
    "Goal": "Ziel",
    "Alerts": "Erinnern",
    "Install": "Installieren",
    "Privacy / Legal": "Datenschutz / Rechtliches",

    // Receipt
    "Hide health benefits": "Gesundheits-Vorteile ausblenden",
    "Days smoke-free": "Tage rauchfrei",
    "Day smoke-free": "Tag rauchfrei",
    "+ {h} h {m} min": "+ {h} Std {m} Min",
    "Estimates for motivation, not medical advice. Health figures are population averages; costs use your entries. Sources in the legal notes.": "Schätzungen zur Motivation, keine medizinische Beratung. Gesundheitswerte sind Durchschnittswerte, Kosten beruhen auf deinen Angaben. Quellen in den rechtlichen Hinweisen.",
    "Add a savings goal": "Sparziel hinzufügen",
    "Show health benefits": "Gesundheits-Vorteile zeigen",
    "You save": "Du sparst",
    "Costs you": "Kostet dich",
    "Per day": "Pro Tag",
    "Per week": "Pro Woche",
    "Per month": "Pro Monat",
    "Per year": "Pro Jahr",
    "Install app": "App installieren",
    "1 day! Share your receipt": "1 Tag! Teile deinen Bon",
    "{days} days! Share your receipt": "{days} Tage! Teile deinen Bon",
    "Smoking costs me {amount} a year. What does it cost you? Find out in 30 seconds:": "Rauchen kostet mich {amount} im Jahr. Und dich? Rechne es in 30 Sekunden aus:",
    "{days} days smoke-free and {amount} not burned. What would you save? Find out in 30 seconds:": "{days} Tage rauchfrei und {amount} nicht verbrannt. Was würdest du sparen? Rechne es in 30 Sekunden aus:",
    "What did smoking cost you so far?": "Was hat dich das Rauchen bisher gekostet?",
    "Edit past spend": "Frühere Ausgaben ändern",
    "Past spend": "Frühere Ausgaben",
    "Since when did you smoke?": "Seit wann hast du geraucht?",
    "Optional. Adds what you paid before quitting to your receipt.": "Optional. Ergänzt deinen Bon um das, was du vor dem Aufhören bezahlt hast.",
    "5 years": "5 Jahre",
    "10 years": "10 Jahre",
    "20 years": "20 Jahre",
    "30 years": "30 Jahre",
    "Cigarettes use average German pack prices, so this receipt is shown in EUR.": "Für Zigaretten werden durchschnittliche deutsche Schachtelpreise genutzt, der Bon wird daher in EUR angezeigt.",
    "Pick a start date before your quit date.": "Wähle ein Datum vor deinem Rauchstopp.",
    "Add to receipt": "Auf den Bon",
    "Quit Receipt": "Rauchfrei-Bon",
    "Minutes": "Minuten",
    "Hours": "Stunden",
    "Days": "Tage",
    "Months": "Monate",
    "Years": "Jahre",
    "Sum money not burned": "Summe nicht verbrannt",
    "PROGRESS ITEMS": "FORTSCHRITT",
    "SAVING FOR": "SPARZIEL",
    "Status": "Status",
    "Still using": "Konsumiere noch",
    "Stop date": "Rauchstopp",
    "Roll-ups avoided": "Selbstgedrehte vermieden",
    "Roll-ups / day": "Selbstgedrehte / Tag",
    "ml not vaped": "ml nicht gevapt",
    "Liquid saved": "Liquid gespart",
    "Accessories saved": "Zubehör gespart",
    "ml / week": "ml / Woche",
    "Cost / 10ml": "Preis / 10 ml",
    "Accessories / mo.": "Zubehör / Monat",
    "Cigarettes / day": "Zigaretten / Tag",
    "Cigarettes / pack": "Zigaretten / Schachtel",
    "Avg past pack": "Ø früher / Schachtel",
    "Avg pack price": "Ø Schachtelpreis",
    "avg DE": "Ø DE",
    "Packs not bought": "Nicht gekaufte Schachteln",
    "+ Saved after quit": "+ Gespart seit Stopp",
    "Cost avoided": "Kosten vermieden",
    "- Paid so far": "- Bisher bezahlt",
    "- Paid before quit": "- Vor dem Stopp bezahlt",
    "Cravings resisted": "Verlangen widerstanden",
    "Estimated life regained*": "Geschätzte Lebenszeit zurück*",
    "*Population average": "*Bevölkerungsdurchschnitt",
    "Not a personal prediction": "Keine persönliche Vorhersage",
    "Next small-print benefit: {title}": "Nächster Vorteil im Kleingedruckten: {title}",
    "Fill in your details to see what comes next.": "Gib deine Daten ein, um zu sehen, was als Nächstes kommt.",
    "Health milestones and life-expectancy estimates are simplified population estimates, not individual predictions or medical advice. Sources are listed in the legal notes. Actual effects vary from person to person. Cost totals use your entries; advanced past-spend totals assume steady use and use historical pack price estimates for cigarettes.":
      "Gesundheits-Meilensteine und Lebenserwartung sind vereinfachte Schätzungen für die Bevölkerung, keine individuellen Vorhersagen und keine medizinische Beratung. Quellen stehen in den rechtlichen Hinweisen. Die tatsächliche Wirkung ist von Person zu Person verschieden. Kosten beruhen auf deinen Angaben; frühere Ausgaben setzen gleichbleibenden Konsum und historische Schachtelpreise voraus.",
    "Thank you for not destroying yourself.": "Danke, dass du dich nicht kaputt machst.",
    "Goal reached. Go get it.": "Ziel erreicht. Hol es dir.",
    "Paid off {date}": "Bezahlt am {date}",
    "PAID": "BEZAHLT",

    // Share
    "SMKFREE Quit Receipt": "SMKFREE Rauchfrei-Bon",
    "Look at my SMKFREE receipt. This is what I didn't spend. Do yours in 30s, no hooks attached.":
      "Mein SMKFREE-Bon: Das habe ich nicht ausgegeben. Mach deinen in 30 Sekunden, ohne Haken.",

    // Goal sheet
    "Ideas": "Ideen",
    "Bicycle": "Fahrrad",
    "Vacation": "Urlaub",
    "Instrument": "Instrument",
    "House": "Haus",
    "Savings goal": "Sparziel",
    "What are you saving for?": "Worauf sparst du?",
    "Your receipt shows how close the money you did not burn gets you.": "Dein Bon zeigt, wie nah dich das nicht verbrannte Geld bringt.",
    "Price": "Preis",
    "New headphones": "Neue Kopfhörer",
    "Enter a name and a price above 0.": "Gib einen Namen und einen Preis über 0 ein.",
    "Remove": "Entfernen",
    "Save goal": "Ziel speichern",
    "Goal added to your receipt": "Ziel steht auf deinem Bon",

    // Alerts sheet
    "Reminders": "Erinnerungen",
    "Get a slip when it counts": "Ein Zettel, wenn es zählt",
    "Notifications stay on this phone. Nothing is sent to a server.": "Mitteilungen bleiben auf diesem Gerät. Nichts wird an einen Server gesendet.",
    "Quit coach": "Rauchfrei-Coach",
    "Short tips that help, most in your first week. Uses your if-then plan.":
      "Kurze Tipps, die helfen, die meisten in deiner ersten Woche. Nutzt deinen Wenn-dann-Plan.",
    "Milestones": "Meilensteine",
    "1 day, 1 week, 1 month … plus health small print.": "1 Tag, 1 Woche, 1 Monat … plus Gesundheits-Kleingedrucktes.",
    "Money milestones": "Geld-Meilensteine",
    "When you pass 50, 100, 500 … not burned.": "Wenn du 50, 100, 500 … nicht verbrannt hast.",
    "Daily receipt": "Täglicher Bon",
    "A short morning summary of your streak.": "Eine kurze Zusammenfassung am Morgen.",
    "Time": "Uhrzeit",
    "Close": "Schließen",
    "Save": "Speichern",
    "Turn on": "Einschalten",
    "Reminders on": "Erinnerungen an",
    "{n} reminders printed": "{n} Erinnerungen gedruckt",
    "Reminders work in the SMKFREE app. The web version cannot schedule them.": "Erinnerungen gibt es in der SMKFREE-App. Die Web-Version kann sie nicht planen.",
    "Notifications are off for SMKFREE. Turn them on in your phone settings.": "Mitteilungen für SMKFREE sind aus. Schalte sie in den Einstellungen deines Handys ein.",

    // SOS sheet
    "Ride it out. 3 minutes.": "Halt durch. 3 Minuten.",
    "Cravings peak and pass. Breathe with the bar.": "Verlangen kommt und geht. Atme mit dem Balken.",
    "One craving is worth": "Ein Craving ist wert",
    "Your next step": "Dein nächster Schritt",
    "Ready": "Bereit",
    "Restart": "Neu starten",
    "Breathe in": "Einatmen",
    "Hold": "Halten",
    "Breathe out": "Ausatmen",
    "Craving passed": "Verlangen vorbei",
    "I made it +1": "Geschafft +1",
    "Craving #{n} resisted": "Verlangen Nr. {n} geschafft",

    // Quit coach notifications
    "Cravings pass": "Verlangen geht vorbei",
    "A craving peaks and fades within minutes. When it hits, open SOS and ride it out.":
      "Verlangen steigt an und ist nach wenigen Minuten wieder weg. Wenn es kommt: SOS öffnen und durchhalten.",
    "Make a plan": "Mach einen Plan",
    "Pick the moments when the urge hits and decide now what you do instead. Find it in SOS.":
      "Wähle die Momente, in denen das Verlangen kommt, und leg jetzt fest, was du stattdessen tust. Du findest es im SOS.",
    "{trigger}? You know what to do: {action}.": "{trigger}? Du weißt, was zu tun ist: {action}.",
    "Move it": "Beweg dich",
    "5 minutes of walking or 10 squats can cut a craving fast, for up to half an hour.":
      "5 Minuten gehen oder 10 Kniebeugen dämpfen Verlangen schnell, für bis zu eine halbe Stunde.",
    "Not a single puff": "Kein einziger Zug",
    "Most relapses happen in the first days. One puff often leads to the next, so keep it at zero.":
      "Die meisten Rückfälle passieren in den ersten Tagen. Ein Zug führt oft zum nächsten, also bleib bei null.",
    "Know your triggers": "Kenne deine Auslöser",
    "Places and people linked to the habit are the strongest triggers. Plan for them or skip them for now.":
      "Orte und Menschen, die mit der Gewohnheit verbunden sind, sind die stärksten Auslöser. Plane sie ein oder meide sie vorerst.",
    "Get backup": "Hol dir Unterstützung",
    "Nicotine patches, gum or prescribed medication can roughly double your chances. Ask a pharmacy or doctor.":
      "Nikotinpflaster, -kaugummi oder verschriebene Medikamente können deine Chancen etwa verdoppeln. Frag in der Apotheke oder beim Arzt.",
    "Slipped?": "Ausgerutscht?",
    "One slip does not erase your progress. Do not let it turn into the next one. Start again right now.":
      "Ein Ausrutscher löscht deinen Fortschritt nicht. Lass keinen zweiten daraus werden. Fang sofort wieder an.",
    "{days} days strong": "{days} Tage stark",
    "Every day without it proves you can do it. Keep going.": "Jeder Tag ohne zeigt, dass du es kannst. Weiter so.",
    "Almost one week": "Fast eine Woche",
    "Withdrawal is usually strongest in the first week and fades over the next few weeks.":
      "Entzugserscheinungen sind meist in der ersten Woche am stärksten und lassen in den folgenden Wochen nach.",

    // Reset sheet
    "Delete everything?": "Alles löschen?",
    "Cancel": "Abbrechen",
    "This removes from this device:": "Das wird von diesem Gerät gelöscht:",
    "Receipt and quit date": "Bon und Rauchstopp-Datum",
    "Reminders and coach": "Erinnerungen und Coach",
    "Craving count": "Craving-Zähler",
    "This cannot be undone. There is no copy on a server.": "Das lässt sich nicht rückgängig machen. Es gibt keine Kopie auf einem Server.",
    "Delete everything": "Alles löschen",
    "All data deleted": "Alle Daten gelöscht",

    // Developer mode
    "Developer": "Entwickler",
    "Version": "Version",
    "Test notifications": "Test-Mitteilungen",
    "Each test arrives in 10 seconds. Lock the phone or switch apps to see it.":
      "Jeder Test kommt nach 10 Sekunden. Sperr das Handy oder wechsle die App, um ihn zu sehen.",
    "Next coach tip": "Nächster Coach-Tipp",
    "Turn off": "Ausschalten",
    "Developer mode on": "Entwicklermodus an",
    "Developer mode off": "Entwicklermodus aus",
    "Developer mode is already on": "Entwicklermodus ist schon an",
    "Developer mode in {n}": "Entwicklermodus in {n}",
    "Needs a quit date in the past": "Braucht ein Rauchstopp-Datum in der Vergangenheit",
    "Web: preview only": "Web: nur Vorschau",
    "Arrives in 10 seconds": "Kommt in 10 Sekunden",

    // Goal ideas
    "Dinner out": "Essen gehen",
    "Headphones": "Kopfhörer",

    // Diary
    "How is it going?": "Wie läuft es?",
    "+ Craving resisted": "+ Verlangen geschafft",
    "+ Slip": "+ Ausrutscher",
    "Slips": "Ausrutscher",
    "Last 7 days": "Letzte 7 Tage",
    "{c} resisted · {s} slips": "{c} geschafft · {s} Ausrutscher",
    "Your triggers": "Deine Auslöser",
    "Entries": "Einträge",
    "No entries yet. After SOS, or with the buttons above, you log a craving in two taps.":
      "Noch keine Einträge. Nach dem SOS oder mit den Knöpfen oben hältst du ein Verlangen mit zwei Tipps fest.",
    "Craving resisted": "Verlangen geschafft",
    "Slipped": "Ausgerutscht",
    "Resisted": "Geschafft",
    "What happened?": "Was ist passiert?",
    "How strong was it?": "Wie stark war es?",
    "Strength": "Stärke",
    "What triggered it?": "Was hat es ausgelöst?",
    "Trigger": "Auslöser",
    "Note (optional)": "Notiz (optional)",
    "One slip does not erase your progress. Your receipt keeps counting. What would help next time?":
      "Ein Ausrutscher löscht deinen Fortschritt nicht. Dein Bon zählt weiter. Was würde dir nächstes Mal helfen?",
    "Logged. Keep going.": "Notiert. Weiter geht's.",
    "Saved to your diary": "Im Tagebuch gespeichert",
    "Entry deleted": "Eintrag gelöscht",
    "Delete entry": "Eintrag löschen",
    "Strength {n}/5": "Stärke {n}/5",
    "Other": "Sonstiges",
    "Most entries: mornings": "Meistens morgens",
    "Most entries: afternoons": "Meistens nachmittags",
    "Most entries: evenings": "Meistens abends",
    "Most entries: nights": "Meistens nachts",
    "Diary entries": "Tagebuch-Einträge",

    // Receipt hint
    "This is your receipt.": "Das ist dein Bon.",
    "It counts up live with every smoke-free minute. Set a goal, share it, or tap + when a craving hits.":
      "Er zählt live mit jeder rauchfreien Minute hoch. Setz dir ein Ziel, teile ihn oder tippe auf +, wenn das Verlangen kommt.",
    "Got it": "Verstanden",

    // Tab bar
    "Main": "Hauptmenü",
    "Receipt": "Bon",
    "Home": "Start",
    "Plan": "Plan",
    "Diary": "Tagebuch",
    "Settings": "Einstellungen",

    // If-then plan
    "If-then plan": "Wenn-dann-Plan",
    "When does the urge usually hit?": "Wann kommt das Verlangen meistens?",
    "Pick up to 3 moments and decide now what you do instead. People who plan this way quit more often.":
      "Wähle bis zu 3 Momente und leg jetzt fest, was du stattdessen tust. Wer so plant, hört öfter dauerhaft auf.",
    "Moments": "Momente",
    "Save plan": "Plan speichern",
    "Your plan": "Dein Plan",
    "Edit plan": "Plan bearbeiten",
    "Plan what you do instead": "Plane, was du stattdessen tust",
    "What you do instead": "Was du stattdessen tust",
    "Up to {n} moments. Remove one first.": "Höchstens {n} Momente. Entferne zuerst einen.",
    "Plan saved. It shows up in SOS.": "Plan gespeichert. Du siehst ihn im SOS.",
    "Plan removed": "Plan entfernt",
    "Coffee": "Kaffee",
    "After a meal": "Nach dem Essen",
    "Drinking alcohol": "Beim Trinken",
    "Stress": "Stress",
    "Breaks": "Pausen",
    "Others smoke": "Andere rauchen",
    "Boredom": "Langeweile",
    "Driving": "Autofahren",
    "Walk for 5 minutes": "5 Minuten gehen",
    "Do 10 squats": "10 Kniebeugen machen",
    "Breathe with SOS": "Mit SOS atmen",
    "Drink a glass of water": "Ein Glas Wasser trinken",
    "Chew gum": "Kaugummi kauen",
    "Text a friend": "Jemandem schreiben",
    "Step away": "Kurz rausgehen",
    "Keep my hands busy": "Hände beschäftigen",

    // Notifications
    "{label} smoke-free": "{label} rauchfrei",
    "1 day": "1 Tag",
    "{n} days": "{n} Tage",
    "1 month": "1 Monat",
    "{n} months": "{n} Monate",
    "1 year": "1 Jahr",
    "{n} years": "{n} Jahre",
    "New line on your receipt. Open SMKFREE to print it.": "Neue Zeile auf deinem Bon. Öffne SMKFREE zum Drucken.",
    "{amount} not burned": "{amount} nicht verbrannt",
    "That money stayed in your pocket. Your receipt is ready.": "Das Geld ist in deiner Tasche geblieben. Dein Bon ist bereit.",
    "PAID: {name}": "BEZAHLT: {name}",
    "You saved {amount}. Treat yourself, you earned it.": "Du hast {amount} gespart. Gönn es dir, du hast es verdient.",
    "Day {days}: {amount} not burned. Keep the streak printing.": "Tag {days}: {amount} nicht verbrannt. Weiter so.",

    // Health milestones (DKFZ timeline)
    "Pulse & blood pressure": "Puls & Blutdruck",
    "Heart rate and blood pressure drop": "Puls und Blutdruck sinken",
    "After 20 minutes your pulse and blood pressure go down.": "Nach 20 Minuten sinken Herzfrequenz und Blutdruck.",
    "Oxygen in the blood": "Sauerstoff im Blut",
    "Carbon monoxide back to normal": "Kohlenmonoxid wieder normal",
    "After 12 hours the carbon monoxide level in your blood matches a nonsmoker's.":
      "Nach 12 Stunden entspricht der Kohlenmonoxidspiegel im Blut dem von Nichtrauchenden.",
    "Circulation & lungs": "Kreislauf & Lunge",
    "Circulation and lungs work better": "Kreislauf und Lunge arbeiten besser",
    "Within 2–12 weeks your circulation and lung function improve.": "Nach 2 bis 12 Wochen verbessern sich Herz-Kreislauf- und Lungenfunktion.",
    "Cough & breath": "Husten & Atem",
    "Less coughing, easier breathing": "Weniger Husten, freier atmen",
    "Within 1–9 months coughing and shortness of breath get better.": "Nach 1 bis 9 Monaten bessern sich Husten und Kurzatmigkeit.",
    "Heart attack risk": "Herzinfarkt-Risiko",
    "Heart attack risk clearly lower": "Herzinfarkt-Risiko deutlich gesenkt",
    "After 1–2 years your risk of a heart attack is clearly reduced.": "Nach 1 bis 2 Jahren ist das Risiko für einen Herzinfarkt deutlich reduziert.",
    "Heart disease & stroke": "Herzkrankheit & Schlaganfall",
    "Heart disease and stroke risk halved": "Risiko für Herzkrankheit und Schlaganfall halbiert",
    "After 5 years the risk of coronary heart disease and stroke is half that of a smoker.":
      "Nach 5 Jahren ist das Risiko für koronare Herzkrankheit und Schlaganfall halb so hoch wie bei Rauchenden.",
    "Lung cancer risk": "Lungenkrebs-Risiko",
    "Lung cancer risk halved": "Lungenkrebs-Risiko halbiert",
    "After 10 years the risk of lung cancer is about half that of a smoker.":
      "Nach 10 Jahren ist das Risiko für Lungenkrebs etwa halb so hoch wie bei Rauchenden.",
    "COPD risk": "COPD-Risiko",
    "COPD risk halved": "COPD-Risiko halbiert",
    "After 15 years the risk of COPD is half that of a smoker.": "Nach 15 Jahren ist das COPD-Risiko halb so hoch wie bei Rauchenden.",
    "First day": "Erster Tag",
    "Old routine": "Alte Routine",
    "One week": "Eine Woche",
    "One month": "Ein Monat",
    "Three months": "Drei Monate",
    "One year": "Ein Jahr",

    // Health tab
    "Health": "Gesundheit",
    "Your body is recovering": "Dein Körper erholt sich",
    "Your vape-free progress": "Dein Fortschritt ohne Vape",
    "{n} of {total} reached": "{n} von {total} erreicht",
    "Starts counting on your quit day.": "Zählt ab deinem Rauchstopp-Tag.",
    "Next: {label}, still {time}": "Als Nächstes: {label}, noch {time}",
    "All milestones reached. Amazing.": "Alle Meilensteine erreicht. Stark.",
    "Reached after {time}": "Erreicht nach {time}",
    "After {time}": "Nach {time}",
    "Still {time} to go": "Noch {time}",
    "The percentage shows how far along you are on the way to each point in time. A simple estimate, not a medical test.":
      "Die Prozentzahl zeigt, wie weit du auf dem Weg zum jeweiligen Zeitpunkt bist. Eine einfache Schätzung, kein medizinischer Befund.",
    "The body-repair timeline is researched for tobacco. For vaping there is too little data yet, so you see your vape-free milestones here.":
      "Der Zeitplan zur Erholung des Körpers ist für Tabak erforscht. Fürs Vapen gibt es noch zu wenig Daten, darum siehst du hier deine Meilensteine ohne Vape.",
    "Free help": "Kostenlose Hilfe",
    "Medication or nicotine replacement plus support roughly doubles your chances. Ask your doctor or pharmacy.":
      "Medikamente oder Nikotinersatz plus Begleitung verdoppeln etwa deine Chancen. Frag in der Arztpraxis oder Apotheke.",
    "Call quit line (DE, free)": "Rauchfrei-Telefon anrufen (kostenlos)",
    "BIÖG phone counseling: 0800 8 31 31 31. Mon–Thu 10–22, Fri–Sun 10–18.":
      "Telefonberatung des BIÖG: 0800 8 31 31 31. Mo–Do 10–22 Uhr, Fr–So 10–18 Uhr.",
    "rauchfrei-info.de online program": "Ausstiegsprogramm auf rauchfrei-info.de",
    "Source:": "Quelle:",
    "German Cancer Research Center (DKFZ)": "Deutsches Krebsforschungszentrum (DKFZ)",
    "{n} min": "{n} Min.",
    "{n} h": "{n} Std.",
    "{n} d": "{n} Tg.",
    "{n} wk": "{n} Wo.",
    "{n} mo": "{n} Mon.",
    "{n} yr": "{n} J.",

    // On-board computer
    "On-board computer": "Bordcomputer",
    "ON-BOARD COMPUTER": "BORDCOMPUTER",
    "Show on display": "Im Display zeigen",
    "Money": "Geld",
    "Life": "Leben",
    "Rolls": "Kippen",
    "Liquid": "Liquid",
    "Light": "Licht",
    "Change display color": "Displayfarbe wechseln",
    "SMOKE-FREE": "RAUCHFREI",
    "DAY": "TAG",
    "DAYS": "TAGE",
    "{y}Y {m}M": "{y}J {m}M",
    "Not quit yet": "Noch nicht aufgehört",
    "{d} days in total": "{d} Tage insgesamt",
    "{m} MON {d} D {h} H": "{m} MON {d} TG {h} STD",
    "+{h} H": "+{h} STD",
    "SAVED": "GESPART",
    "Money not burned": "Geld nicht verbrannt",
    "LIFE BACK*": "LEBEN ZURÜCK*",
    "{d}D {h}H": "{d}T {h}H",
    "{h}H {m}M": "{h}H {m}M",
    "*Estimate: 20 min per cigarette": "*Schätzung: 20 Min. pro Zigarette",
    "NOT ROLLED": "NICHT GEDREHT",
    "PCS": "STK",
    "Roll-ups you did not smoke": "Selbstgedrehte, die du nicht geraucht hast",
    "NOT VAPED": "NICHT GEDAMPFT",
    "Liquid you did not vape": "Liquid, das du nicht gedampft hast",

    // Start: today card, SOS card, "+" sheet
    "Log": "Eintrag",
    "New entry or SOS": "Neuer Eintrag oder SOS",
    "Craving help": "Hilfe bei Verlangen",
    "Craving right now?": "Gerade Verlangen?",
    "It passes in a few minutes. Ride it out with us.": "Es geht in ein paar Minuten vorbei. Halte mit uns durch.",
    "How strong was the urge today?": "Wie stark war das Verlangen heute?",
    "Checked in for today": "Für heute eingecheckt",
    "None": "Keins",
    "Mild": "Leicht",
    "Medium": "Mittel",
    "Strong": "Stark",
    "This week": "Diese Woche",
    "{n} of 7 days this week": "{n} von 7 Tagen diese Woche",
    "Tip of the day": "Tipp des Tages",
    "Clean day. That is what free feels like.": "Ein Tag ohne Verlangen. So fühlt sich frei an.",
    "Well done. A light urge passes on its own.": "Gut gemacht. Leichtes Verlangen geht von selbst vorbei.",
    "You held on. A plan makes the next one easier.": "Du hast durchgehalten. Mit einem Plan wird das nächste Mal leichter.",
    "Tough day, and you are still smoke-free. Next time tap SOS right away.":
      "Harter Tag, und du bist trotzdem rauchfrei. Tippe nächstes Mal gleich auf SOS.",
    "Start SOS": "SOS starten",
    "What's up?": "Was ist los?",
    "Craving now: SOS, 3 minutes": "Verlangen jetzt: SOS, 3 Minuten",
    "I resisted a craving": "Verlangen widerstanden",
    "I slipped": "Ausgerutscht",

    // Board keys, SOS page, first day
    "Open": "Öffnen",
    "SOS: help with a craving now": "SOS: jetzt Hilfe bei Verlangen",
    "Body": "Körper",
    "{time} until {goal}": "noch {time} bis {goal}",
    "{amount} to {goal}": "noch {amount} bis {goal}",
    "Check in for today": "Heute einchecken",
    "Quit day": "Rauchstopp",
    "{n} of {total}": "{n} von {total}",
    "Craving? Breathe for 3 minutes.": "Verlangen? 3 Minuten atmen.",
    "How was today?": "Wie war heute?",
    "Checked in": "Eingecheckt",
    "Print and share": "Drucken und teilen",
    "Colors": "Farben",
    "{n} of {total} · next on day {day}": "{n} von {total} · nächste ab Tag {day}",
    "All {total} unlocked": "Alle {total} freigeschaltet",
    "Progress to your next goals": "Fortschritt zu deinen nächsten Zielen",
    "Smoke-free": "Rauchfrei",
    "Saved": "Gespart",
    "Life back*": "Leben zurück*",
    "Not rolled": "Nicht gedreht",
    "Not vaped": "Nicht gedampft",
    "{y} yr {m} mo": "{y} J. {m} Mon.",
    "{d} d {h} h": "{d} Tg. {h} Std.",
    "{h} h {m} min": "{h} Std. {m} Min.",
    "{n} roll-ups": "{n} Selbstgedrehte",
    "GOAL {x}": "ZIEL {x}",
    "+ SAVINGS GOAL": "+ SPARZIEL",
    "{amount} to go": "noch {amount}",
    "{amount} to go until {target}": "noch {amount} bis {target}",
    "Starts on your quit day": "Startet an deinem Rauchstopp-Tag",
    "Display": "Anzeige",
    "Display ▸": "Anzeige ▸",
    "Switch display: days, money, life": "Anzeige wechseln: Tage, Geld, Leben",
    "‹ Back to start": "‹ Zurück zum Start",
    "HOUR": "STD.",
    "HOURS": "STD.",
    "Day 1 is running. The first hours count most.": "Tag 1 läuft. Die ersten Stunden zählen am meisten.",
    "The urge passes. Breathe along.": "Das Verlangen geht vorbei. Atme mit.",
    "Done, the urge is gone": "Geschafft, Verlangen ist weg",
    "Stop": "Abbrechen",
    "{time} left": "noch {time}",
    "You made it": "Geschafft",
    "Save it": "Eintragen",

    // Retention: evening check-in, rewards, week receipt
    "Evening check-in": "Abend-Check-in",
    "At 8 pm, only if you have not checked in yet.": "Um 20 Uhr, nur wenn du noch nicht eingecheckt hast.",
    "Week receipt": "Wochen-Bon",
    "Sunday evening: your week at a glance.": "Sonntagabend: deine Woche auf einen Blick.",
    "Quick check-in?": "Kurz einchecken?",
    "One tap: how strong was the urge today?": "Ein Tipp: Wie stark war das Verlangen heute?",
    "Your week receipt is ready": "Dein Wochen-Bon ist da",
    "Check-ins, cravings and money not burned this week.": "Check-ins, Verlangen und nicht verbranntes Geld dieser Woche.",
    "WEEK RECEIPT": "WOCHEN-BON",
    "Smoke-free this week": "Rauchfrei diese Woche",
    "Not burned": "Nicht verbrannt",
    "Check-ins": "Check-ins",
    "A slip this week, and you kept going. That counts.": "Ein Ausrutscher diese Woche, und du bist drangeblieben. Das zählt.",
    "Tough days this week, and you came through them.": "Harte Tage diese Woche, und du hast sie geschafft.",
    "{n} cravings resisted. Each one gets easier.": "{n}× Verlangen widerstanden. Jedes Mal wird es leichter.",
    "A calm week. Keep it up.": "Eine ruhige Woche. Weiter so.",
    "My SMKFREE week: {days} days smoke-free, {amount} not burned, {cravings} cravings resisted.":
      "Meine SMKFREE-Woche: {days} Tage rauchfrei, {amount} nicht verbrannt, {cravings}× Verlangen widerstanden.",
    "Copied. Paste it anywhere.": "Kopiert. Füg es ein, wo du willst.",
    "Sharing is not available here.": "Teilen ist hier nicht verfügbar.",
    "New display color unlocked": "Neue Displayfarbe freigeschaltet",
    "NEW": "NEU",
    "Next color on day {day}": "Nächste Farbe ab Tag {day}",

    // Diary, simplified
    "+ New entry": "+ Neuer Eintrag",
    "New entry": "Neuer Eintrag",
    "Edit entry": "Eintrag ändern",
    "No entries yet.": "Noch keine Einträge.",
    "Not sure": "Weiß nicht",
    "A slip erases nothing. Your receipt keeps counting.": "Ein Ausrutscher löscht nichts. Dein Bon zählt weiter.",
    "Last 7 days: {c} resisted · {s} slips": "Letzte 7 Tage: {c} geschafft · {s} Ausrutscher",
    "Most common trigger: {trigger}": "Häufigster Auslöser: {trigger}",

    // Developer: font and size
    "Font and size": "Schrift und Größe",
    "Font": "Schriftart",
    "Standard (mono)": "Standard (Mono)",
    "System (sans-serif)": "System (serifenlos)",
    "Rounded": "Abgerundet",
    "Serif": "Serifen",
    "Typewriter": "Schreibmaschine",
    "Text size": "Textgröße",
    "Reset font and size": "Schrift und Größe zurücksetzen",
    "Font and size reset": "Schrift und Größe zurückgesetzt",

    "First vape-free day": "Erster Tag ohne Vape",
    "One day of practicing a new routine.": "Ein Tag mit einer neuen Routine.",
    "Break a routine": "Routine durchbrechen",
    "Notice a moment you would usually vape.": "Bemerke einen Moment, in dem du sonst gevapt hättest.",
    "One week of choices": "Eine Woche Entscheidungen",
    "A week of practicing your plan.": "Eine Woche, in der du deinen Plan übst.",
    "Notice your triggers": "Erkenne deine Auslöser",
    "Recognize situations linked to vaping.": "Erkenne Situationen, die mit dem Vapen verknüpft sind.",
    "One month of practice": "Ein Monat Übung",
    "Your new routine has had time to grow.": "Deine neue Routine hatte Zeit zu wachsen.",
    "Keep building": "Weiter aufbauen",
    "Each vape-free choice adds to your progress.": "Jede Entscheidung gegen die Vape zählt.",
    "A year of progress": "Ein Jahr Fortschritt",
    "A year of choosing your own next step.": "Ein Jahr, in dem du deinen nächsten Schritt selbst wählst.",
  },
};

function detectLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved && languages[saved]) return saved;
  } catch { /* storage unavailable */ }
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language || "en"];
  for (const tag of preferred) {
    const base = String(tag).toLowerCase().split("-")[0];
    if (languages[base]) return base;
  }
  return "en";
}

let current = detectLanguage();

export function getLanguage() {
  return current;
}

export function intlLocale() {
  return languages[current].intl;
}

export function t(key, vars) {
  let text = dictionaries[current]?.[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

/** Translates every opted-in element. Remembers the English source so switching back works. */
export function applyTranslations(root = document) {
  document.documentElement.lang = current;
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    if (!el.dataset.i18nKey) el.dataset.i18nKey = el.dataset.i18n || el.textContent.trim().replace(/\s+/g, " ");
    el.textContent = t(el.dataset.i18nKey);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    if (!el.dataset.i18nPlaceholderKey) el.dataset.i18nPlaceholderKey = el.getAttribute("placeholder") || "";
    const source = el.dataset.i18nPlaceholderKey;
    // Numeric placeholders only switch their decimal separator.
    el.placeholder = /^[\d.]+$/.test(source) ? formatDecimalPlaceholder(source) : t(source);
  });
  root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    if (!el.dataset.i18nAriaKey) el.dataset.i18nAriaKey = el.getAttribute("aria-label") || "";
    el.setAttribute("aria-label", t(el.dataset.i18nAriaKey));
  });
}

function formatDecimalPlaceholder(value) {
  return current === "de" ? value.replace(".", ",") : value;
}

export function setLanguage(language) {
  if (!languages[language]) return;
  current = language;
  try { localStorage.setItem(LANGUAGE_KEY, language); } catch { /* ignore */ }
  applyTranslations();
}

export function nextLanguage() {
  const codes = Object.keys(languages);
  return codes[(codes.indexOf(current) + 1) % codes.length];
}

export { LANGUAGE_KEY };
