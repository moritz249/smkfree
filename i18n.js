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
    "Print my receipt": "Meinen Bon drucken",
    "Habit": "Gewohnheit",
    "Not burned so far": "Bisher nicht verbrannt",
    "Costs you per year": "Kostet dich pro Jahr",
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
    "Reset your saved receipt? Goal, reminders and craving count are deleted too.": "Gespeicherten Bon zurücksetzen? Sparziel, Erinnerungen und Craving-Zähler werden ebenfalls gelöscht.",
    "Decrease": "Weniger",
    "Increase": "Mehr",
    "Language": "Sprache",

    // Receipt actions
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
    "Cravings resisted": "Cravings widerstanden",
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
    "Craving #{n} resisted": "Craving #{n} widerstanden",

    // Notifications
    "{label} smoke-free": "{label} rauchfrei",
    "1 day": "1 Tag",
    "{n} days": "{n} Tage",
    "New line on your receipt. Open SMKFREE to print it.": "Neue Zeile auf deinem Bon. Öffne SMKFREE zum Drucken.",
    "{amount} not burned": "{amount} nicht verbrannt",
    "That money stayed in your pocket. Your receipt is ready.": "Das Geld ist in deiner Tasche geblieben. Dein Bon ist bereit.",
    "PAID: {name}": "BEZAHLT: {name}",
    "You saved {amount}. Treat yourself, you earned it.": "Du hast {amount} gespart. Gönn es dir, du hast es verdient.",
    "Day {days}: {amount} not burned. Keep the streak printing.": "Tag {days}: {amount} nicht verbrannt. Weiter so.",

    // Health milestones
    "Heart rate drops": "Puls sinkt",
    "A benefit that can begin within minutes.": "Ein Effekt, der schon nach Minuten beginnen kann.",
    "Nicotine clears": "Nikotin abgebaut",
    "Nicotine levels in the blood drop to zero.": "Der Nikotinspiegel im Blut sinkt auf null.",
    "Carbon monoxide falls": "Kohlenmonoxid sinkt",
    "Within several days, levels can reach those of a nonsmoker.": "Innerhalb weniger Tage kann der Wert den eines Nichtrauchers erreichen.",
    "Breathing may ease": "Atmen wird leichter",
    "Coughing and shortness of breath can decrease over 1–12 months.": "Husten und Kurzatmigkeit können über 1–12 Monate abnehmen.",
    "Heart attack risk falls": "Herzinfarktrisiko sinkt",
    "Risk drops sharply over 1–2 years after quitting.": "Das Risiko sinkt in 1–2 Jahren nach dem Aufhören deutlich.",
    "Heart health improves": "Herzgesundheit verbessert sich",
    "Added coronary heart disease risk drops over 3–6 years.": "Das zusätzliche Risiko für koronare Herzkrankheit sinkt über 3–6 Jahre.",
    "Stroke risk decreases": "Schlaganfallrisiko sinkt",
    "The added risk of stroke continues to fall over time.": "Das zusätzliche Schlaganfallrisiko sinkt mit der Zeit weiter.",
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
