import {
  calculateProgress,
  estimateAdvancedSpend,
  formatLifeSaved,
  hasCompleteSavedState,
  parseDecimal,
  asciiBar,
  buildNotificationPlan,
  buildCoachPlan,
  dailySaving,
  goalProgress,
  dayThresholds,
  normalizePlan,
  normalizeDiary,
  diaryStats,
  recoveryProgress,
  boardData,
  checkinWeek,
  dateKey,
  normalizeCheckins,
  boardThemeStatus,
  boardGoals,
  receiptColorStatus,
  OLD_RECEIPT_COLORS,
  DIARY_NOTE_MAX,
  PLAN_MAX_ITEMS,
} from "./app-core.js";
import {
  appInfo,
  configureChrome,
  haptics,
  isNativeApp,
  mirrorAllStorage,
  mirrorStorage,
  notificationPermission,
  notificationsSupported,
  onAppResume,
  onNotificationTap,
  replaceScheduledNotifications,
  requestNotificationPermission,
  restoreMirroredStorage,
  scheduleTestNotification,
  setStatusBarDark,
  shareImageNative,
  shareLinkNative,
} from "./native.js";
import { applyTranslations, getLanguage, intlLocale, languages, nextLanguage, setLanguage, t } from "./i18n.js";

// Restore data that iOS may have evicted from WebView storage before anything reads it.
await restoreMirroredStorage();
configureChrome();
// Always open at the top of the on-board computer, not where the last session scrolled to.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

const STORAGE_KEY = "smoke-free-progress";
const STORAGE_VERSION = 4;
const GOAL_KEY = "smkfree-goal";
const REMINDERS_KEY = "smkfree-reminders";
const CRAVINGS_KEY = "smkfree-cravings";
const PLAN_KEY = "smkfree-plan";
const HINT_KEY = "smkfree-hint-receipt";
const DIARY_KEY = "smkfree-diary";
const SHARE_PROMPT_KEY = "smkfree-share-milestone";
const BOARD_KEY = "smkfree-board";
const CHECKIN_KEY = "smkfree-checkins";
const WEEK_SEEN_KEY = "smkfree-week-seen";
// Display colors of the on-board computer; "LIGHT" cycles through them. Add a theme in styles.css (.obc[data-obc-theme]).
const BOARD_METRICS = ["time", "money", "third"];
const SOS_SECONDS = 180;
const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
let reminderSyncTimer = null;
let activeTab = "receipt";
let appReady = false;
const modeNames = { cigarettes: "Cigarettes", ryo: "Roll-your-own", vaping: "Vaping" };

// Health timeline after quitting tobacco, following the DKFZ (German Cancer Research Center):
// dkfz.de/forschung/translationale-zentren/ncpc/stabsstelle-krebspraevention/rauchstopp
// "hours" is the end of the range the source names (e.g. 2–12 weeks -> 12 weeks).
const tobaccoMilestones = [
  { hours: 1 / 3, label: "Pulse & blood pressure", icon: "i-pulse", title: "Heart rate and blood pressure drop", detail: "After 20 minutes your pulse and blood pressure go down." },
  { hours: 12, label: "Oxygen in the blood", icon: "i-drop", title: "Carbon monoxide back to normal", detail: "After 12 hours the carbon monoxide level in your blood matches a nonsmoker's." },
  { hours: 2016, label: "Circulation & lungs", icon: "i-lungs", title: "Circulation and lungs work better", detail: "Within 2–12 weeks your circulation and lung function improve." },
  { hours: 6570, label: "Cough & breath", icon: "i-breath", title: "Less coughing, easier breathing", detail: "Within 1–9 months coughing and shortness of breath get better." },
  { hours: 17520, label: "Heart attack risk", icon: "i-heart", title: "Heart attack risk clearly lower", detail: "After 1–2 years your risk of a heart attack is clearly reduced." },
  { hours: 43800, label: "Heart disease & stroke", icon: "i-brain", title: "Heart disease and stroke risk halved", detail: "After 5 years the risk of coronary heart disease and stroke is half that of a smoker." },
  { hours: 87600, label: "Lung cancer risk", icon: "i-shield", title: "Lung cancer risk halved", detail: "After 10 years the risk of lung cancer is about half that of a smoker." },
  { hours: 131400, label: "COPD risk", icon: "i-lungs", title: "COPD risk halved", detail: "After 15 years the risk of COPD is half that of a smoker." },
];

const vapingMilestones = [
  { hours: 24, label: "First day", icon: "i-sun", title: "First vape-free day", detail: "One day of practicing a new routine." },
  { hours: 72, label: "Old routine", icon: "i-clock", title: "Break a routine", detail: "Notice a moment you would usually vape." },
  { hours: 168, label: "One week", icon: "i-calendar", title: "One week of choices", detail: "A week of practicing your plan." },
  { hours: 336, label: "Your triggers", icon: "i-target", title: "Notice your triggers", detail: "Recognize situations linked to vaping." },
  { hours: 720, label: "One month", icon: "i-calendar", title: "One month of practice", detail: "Your new routine has had time to grow." },
  { hours: 2160, label: "Three months", icon: "i-target", title: "Keep building", detail: "Each vape-free choice adds to your progress." },
  { hours: 8760, label: "One year", icon: "i-sun", title: "A year of progress", detail: "A year of choosing your own next step." },
];

const elements = {
  form: document.querySelector("#quitForm"),
  siteFooter: document.querySelector(".site-footer"),
  appShell: document.querySelector("#appShell"),
  stage: document.querySelector("#stage"),
  resetButton: document.querySelector("#resetButton"),
  backButton: document.querySelector("#backButton"),
  nextButton: document.querySelector("#nextButton"),
  receiptButton: document.querySelector("#receiptButton"),
  editButton: document.querySelector("#editButton"),
  downloadButton: document.querySelector("#downloadButton"),
  stepCounter: document.querySelector("#stepCounter"),
  progressFill: document.querySelector("#progressFill"),
  progressPercent: document.querySelector("#progressPercent"),
  steps: [...document.querySelectorAll(".step")],
  modeRadios: [...document.querySelectorAll("input[name='mode']")],
  modeCards: [...document.querySelectorAll(".mode-card")],
  quitDate: document.querySelector("#quitDate"),
  quitDateError: document.querySelector("#quitDateError"),
  notStoppedYet: document.querySelector("#notStoppedYet"),
  advancedMode: document.querySelector("#advancedMode"),
  advancedPanel: document.querySelector("#advancedPanel"),
  showBenefitsToggle: document.querySelector("#showBenefits"),
  fineBenefits: document.querySelector(".fine-benefits"),
  smokingStartDate: document.querySelector("#smokingStartDate"),
  currencyCodes: [...document.querySelectorAll(".currency-code")],
  currencySymbols: document.querySelectorAll(".currency-symbol"),
  cigarettesPerDay: document.querySelector("#cigarettesPerDay"),
  cigarettesPerPack: document.querySelector("#cigarettesPerPack"),
  pricePerPack: document.querySelector("#pricePerPack"),
  rollsPerDay: document.querySelector("#rollsPerDay"),
  weeklyRyoCost: document.querySelector("#weeklyRyoCost"),
  mlPerWeek: document.querySelector("#mlPerWeek"),
  costPer10ml: document.querySelector("#costPer10ml"),
  accessoriesPerMonth: document.querySelector("#accessoriesPerMonth"),
  summaryList: document.querySelector("#summaryList"),
  receiptDate: document.querySelector("#receiptDate"),
  receiptRows: document.querySelector("#receiptRows"),
  moneySaved: document.querySelector("#moneySaved"),
  daysFree: document.querySelector("#daysFree"),
  milestoneList: document.querySelector("#milestoneList"),
  nextMilestone: document.querySelector("#nextMilestone"),
  receipt: document.querySelector("#receipt"),
  receiptFeed: document.querySelector("#receiptFeed"),
  receiptGoal: document.querySelector("#receiptGoal"),
  goalName: document.querySelector("#goalName"),
  goalBar: document.querySelector("#goalBar"),
  goalSaved: document.querySelector("#goalSaved"),
  goalPercent: document.querySelector("#goalPercent"),
  goalEta: document.querySelector("#goalEta"),
  goalStamp: document.querySelector("#goalStamp"),
  sheetBackdrop: document.querySelector("#sheetBackdrop"),
  goalSheet: document.querySelector("#goalSheet"),
  goalNameInput: document.querySelector("#goalNameInput"),
  goalPriceInput: document.querySelector("#goalPriceInput"),
  goalError: document.querySelector("#goalError"),
  alertsSheet: document.querySelector("#alertsSheet"),
  alertsStatus: document.querySelector("#alertsStatus"),
  alertsOptions: document.querySelector("#alertsOptions"),
  alertCoach: document.querySelector("#alertCoach"),
  alertMilestones: document.querySelector("#alertMilestones"),
  alertMoney: document.querySelector("#alertMoney"),
  alertDaily: document.querySelector("#alertDaily"),
  alertTime: document.querySelector("#alertTime"),
  alertTimeField: document.querySelector("#alertTimeField"),
  alertsSave: document.querySelector("#alertsSave"),
  sosPage: document.querySelector("#sosPage"),
  receiptWrap: document.querySelector("#receiptWrap"),
  diaryCravings: document.querySelector("#diaryCravings"),
  diarySlips: document.querySelector("#diarySlips"),
  diaryWeek: document.querySelector("#diaryWeek"),
  diaryTriggersBox: document.querySelector("#diaryTriggersBox"),
  diaryTriggers: document.querySelector("#diaryTriggers"),
  diaryTime: document.querySelector("#diaryTime"),
  diaryList: document.querySelector("#diaryList"),
  diaryEmpty: document.querySelector("#diaryEmpty"),
  diarySheet: document.querySelector("#diarySheet"),
  diarySheetTitle: document.querySelector("#diarySheetTitle"),
  diaryKind: document.querySelector("#diaryKind"),
  diaryStrength: document.querySelector("#diaryStrength"),
  diaryTriggerChips: document.querySelector("#diaryTriggerChips"),
  diaryNote: document.querySelector("#diaryNote"),
  diarySlipHint: document.querySelector("#diarySlipHint"),
  sosDone: document.querySelector("#sosDone"),
  sosStop: document.querySelector("#sosStop"),
  sosTimer: document.querySelector("#sosTimer"),
  sosFill: document.querySelector("#sosFill"),
  breathDisc: document.querySelector("#breathDisc"),
  breathCount: document.querySelector("#breathCount"),
  breathPhase: document.querySelector("#breathPhase"),
  sosPlanBox: document.querySelector("#sosPlanBox"),
  sosPlanList: document.querySelector("#sosPlanList"),
  planTriggers: document.querySelector("#planTriggers"),
  planRows: document.querySelector("#planRows"),
  planRemove: document.querySelector("#planRemove"),
  planValue: document.querySelector("#planValue"),
  resetSheet: document.querySelector("#resetSheet"),
  devSheet: document.querySelector("#devSheet"),
  devButton: document.querySelector("#devButton"),
  devStatus: document.querySelector("#devStatus"),
  devCoachValue: document.querySelector("#devCoachValue"),
  versionValue: document.querySelector("#versionValue"),
  toast: document.querySelector("#toast"),
};

let currentStep = 0;
let currentMode = "cigarettes";
let currentCurrency = "EUR";
let currentAdvanced = false;
let currentShowBenefits = false;
let receiptRefreshTimer = null;

let numberFormatter;
let decimalFormatter;

function refreshFormatters() {
  numberFormatter = new Intl.NumberFormat(intlLocale(), { maximumFractionDigits: 0 });
  decimalFormatter = new Intl.NumberFormat(intlLocale(), { maximumFractionDigits: 1 });
}
refreshFormatters();

const decimalInputIds = new Set(["pricePerPack", "weeklyRyoCost", "costPer10ml", "accessoriesPerMonth"]);
const advancedCurrencyCode = "EUR";


function setButtonLabel(button, text) {
  const label = button.querySelector("span[data-i18n]") || button;
  label.textContent = text;
}

function todayAsInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCurrency(value, currencyCode) {
  return new Intl.NumberFormat(intlLocale(), { style: "currency", currency: currencyCode }).format(value);
}

function getCurrencySymbol(currencyCode) {
  const parts = new Intl.NumberFormat(intlLocale(), {
    style: "currency", currency: currencyCode, currencyDisplay: "narrowSymbol",
  }).formatToParts(0);
  return parts.find((p) => p.type === "currency")?.value || currencyCode;
}

function formatDate(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat(intlLocale(), {
    year: "numeric", month: "short", day: "2-digit",
  }).format(new Date(`${value}T00:00:00`));
}

function updateCurrencySymbols(currencyCode) {
  currentCurrency = currencyCode || "EUR";
  const symbol = getCurrencySymbol(currentCurrency);
  elements.currencyCodes.forEach((el) => { el.value = currentCurrency; });
  elements.currencySymbols.forEach((el) => { el.textContent = symbol; });
}

function updateModeCards() {
  elements.modeCards.forEach((card) => {
    const radio = card.querySelector("input[type='radio']");
    const isActive = radio?.value === currentMode;
    if (radio) radio.checked = isActive;
    card.classList.toggle("is-active", isActive);
  });
}

function getActiveSteps() {
  return elements.steps.filter(
    (step) => {
      const matchesMode = step.dataset.mode === "all" || step.dataset.mode === currentMode;
      return matchesMode;
    }
  );
}

function supportsAdvancedMode(mode) {
  return ["cigarettes", "ryo", "vaping"].includes(mode);
}

function getEffectiveCurrencyCode(mode, isAdvanced, currencyCode) {
  return mode === "cigarettes" && isAdvanced ? advancedCurrencyCode : currencyCode || "EUR";
}

function syncBenefitsVisibility() {
  elements.fineBenefits.classList.toggle("is-hidden", !currentShowBenefits);
  const benefitsValue = document.querySelector("#benefitsValue");
  if (benefitsValue) benefitsValue.textContent = currentShowBenefits ? t("On") : t("Off");
}

function syncAdvancedFields() {
  const canUseAdvanced = supportsAdvancedMode(currentMode);
  if (!canUseAdvanced) currentAdvanced = false;

  // Past spend now lives in its own optional sheet on the receipt, so the field stays usable.
  elements.advancedMode.checked = currentAdvanced;
  elements.smokingStartDate.max = elements.quitDate.value || todayAsInputValue();
  if (currentAdvanced && currentMode === "cigarettes") updateCurrencySymbols(advancedCurrencyCode);
}

function syncNotStoppedFields() {
  const isStillUsing = elements.notStoppedYet.checked;
  elements.quitDate.disabled = isStillUsing;
  elements.quitDate.required = !isStillUsing;
  if (isStillUsing) {
    elements.quitDate.value = "";
    setQuitDateError("");
  }
  syncAdvancedFields();
}

function setQuitDateError(message) {
  elements.quitDate.setCustomValidity(message);
  elements.quitDateError.textContent = message || t("Please enter a quit date.");
  elements.quitDateError.classList.toggle("is-hidden", !message);
}

function readState() {
  const fallback = {
    mode: "cigarettes",
    isAdvanced: false,
    notStoppedYet: false,
    showBenefits: false,
    quitDate: "",
    smokingStartDate: "",
    currencyCode: "EUR",
    cigarettesPerDay: "",
    cigarettesPerPack: "",
    pricePerPack: "",
    rollsPerDay: "",
    weeklyRyoCost: "",
    mlPerWeek: "",
    costPer10ml: "",
    accessoriesPerMonth: "",
  };
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return fallback;
  try {
    const parsed = JSON.parse(stored);
    if (parsed.version !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return fallback;
    }
    return {
      ...fallback,
      ...parsed,
      isAdvanced: Boolean(parsed.isAdvanced),
      notStoppedYet: Boolean(parsed.notStoppedYet),
      showBenefits: Boolean(parsed.showBenefits),
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return fallback;
  }
}

function storedWizardDone() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    // States saved before this flag existed were always finished receipts.
    return stored ? stored.wizardDone !== false : false;
  } catch {
    return false;
  }
}

function writeState(state) {
  const wizardDone = elements.stage.classList.contains("is-receipt-only") || storedWizardDone();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...state,
    version: STORAGE_VERSION,
    wizardDone,
    wizardStep: currentStep,
  }));
  mirrorStorage(STORAGE_KEY);
  scheduleReminderSync();
}

function saveCurrentState() {
  writeState(getFormState());
}

function getFormState() {
  const activeSteps = getActiveSteps();
  const activeCurrencyCode = activeSteps[currentStep]?.querySelector(".currency-code")?.value;
  const isStillUsing = elements.notStoppedYet.checked;
  const isAdvanced = currentAdvanced && supportsAdvancedMode(currentMode);
  const currencyCode = getEffectiveCurrencyCode(currentMode, isAdvanced, activeCurrencyCode || currentCurrency);

  return {
    mode: currentMode,
    isAdvanced,
    notStoppedYet: isStillUsing,
    showBenefits: currentShowBenefits,
    quitDate: isStillUsing ? "" : elements.quitDate.value,
    smokingStartDate: elements.smokingStartDate.value,
    currencyCode,
    cigarettesPerDay: Number(elements.cigarettesPerDay.value) || 0,
    cigarettesPerPack: Number(elements.cigarettesPerPack.value) || 0,
    pricePerPack: parseDecimal(elements.pricePerPack.value) ?? 0,
    rollsPerDay: Number(elements.rollsPerDay.value) || 0,
    weeklyRyoCost: parseDecimal(elements.weeklyRyoCost.value) ?? 0,
    mlPerWeek: Number(elements.mlPerWeek.value) || 0,
    costPer10ml: parseDecimal(elements.costPer10ml.value) ?? 0,
    accessoriesPerMonth: parseDecimal(elements.accessoriesPerMonth.value) ?? 0,
  };
}

function setFormState(state) {
  currentMode = state.mode || "cigarettes";
  currentAdvanced = false; // past-spend feature removed
  currentCurrency = getEffectiveCurrencyCode(currentMode, currentAdvanced, state.currencyCode);
  const radio = elements.modeRadios.find((r) => r.value === currentMode);
  if (radio) radio.checked = true;
  updateModeCards();

  // Most people start today: the date is filled in, and can still be changed.
  elements.quitDate.value = state.quitDate || (state.notStoppedYet ? "" : todayAsInputValue());
  elements.quitDate.max = todayAsInputValue();
  elements.notStoppedYet.checked = Boolean(state.notStoppedYet);
  elements.advancedMode.checked = currentAdvanced;
  currentShowBenefits = Boolean(state.showBenefits);
  elements.showBenefitsToggle.checked = currentShowBenefits;
  syncBenefitsVisibility();
  elements.smokingStartDate.value = state.smokingStartDate || "";
  elements.smokingStartDate.max = state.quitDate || todayAsInputValue();
  elements.cigarettesPerDay.value = state.cigarettesPerDay || "";
  elements.cigarettesPerPack.value = state.cigarettesPerPack || "20";
  elements.pricePerPack.value = state.pricePerPack || "";
  elements.rollsPerDay.value = state.rollsPerDay || "";
  elements.weeklyRyoCost.value = state.weeklyRyoCost || "";
  elements.mlPerWeek.value = state.mlPerWeek || "";
  elements.costPer10ml.value = state.costPer10ml || "";
  elements.accessoriesPerMonth.value = state.accessoriesPerMonth || "";
  updateCurrencySymbols(currentCurrency);
  syncNotStoppedFields();
  syncAdvancedFields();
}

function renderReceiptRows(rows) {
  elements.receiptRows.innerHTML = rows
    .map(([label, value]) => {
      const noteClass = label.startsWith("*") ? " class=\"receipt__note\"" : "";
      return `<div${noteClass}><dt>${label}</dt><dd>${value}</dd></div>`;
    })
    .join("");
}

/** Hours and minutes in the first month, then "1 year, 2 months, 5 days". */
function formatTimeFree(progress) {
  if (progress.compYears < 1 && progress.compMonths < 1) {
    return t("+ {h} h {m} min", { h: progress.compHours, m: progress.compMinutes });
  }
  const parts = [];
  if (progress.compYears > 0) {
    parts.push(progress.compYears === 1 ? t("1 year") : t("{n} years", { n: progress.compYears }));
  }
  if (progress.compMonths > 0) {
    parts.push(progress.compMonths === 1 ? t("1 month") : t("{n} months", { n: progress.compMonths }));
  }
  if (progress.compDays > 0) {
    parts.push(progress.compDays === 1 ? t("1 day") : t("{n} days", { n: progress.compDays }));
  }
  return `= ${parts.join(", ")}`;
}

function renderReceipt(progress, state) {
  updateCurrencySymbols(state.currencyCode);
  elements.receiptDate.textContent = new Intl.DateTimeFormat(intlLocale(), {
    dateStyle: "medium", timeStyle: "short",
  }).format(new Date());
  // One big number: whole days smoke-free, hours and minutes as small print.
  document.querySelector("#heroDays").classList.toggle("is-hidden", state.notStoppedYet);
  elements.daysFree.textContent = numberFormatter.format(progress.wholeDays);
  document.querySelector("#daysLabel").textContent = progress.wholeDays === 1 ? t("Day smoke-free") : t("Days smoke-free");
  document.querySelector("#timeFree").textContent = formatTimeFree(progress);
  elements.moneySaved.textContent = formatCurrency(state.notStoppedYet ? 0 : progress.moneySaved, state.currencyCode);

  const rows = state.notStoppedYet
    ? [[t("Status"), t("Still using")]]
    : [[t("Quit date"), formatDate(state.quitDate), "quitDate"]];

  if (state.mode === "ryo") {
    if (!state.notStoppedYet) {
      rows.push([t("Roll-ups avoided"), numberFormatter.format(progress.rollsAvoided)]);
    }
    rows.push(
      [t("Roll-ups / day"), numberFormatter.format(state.rollsPerDay), "rollsPerDay"],
      [t("Weekly spend"), formatCurrency(state.notStoppedYet ? state.weeklyRyoCost : progress.weeklyRyoCost, state.currencyCode), "weeklyRyoCost"],
    );
  } else if (state.mode === "vaping") {
    if (!state.notStoppedYet) {
      rows.push(
        [t("ml not vaped"), `${decimalFormatter.format(progress.mlNotVaped)} ml`],
      );
    }
    rows.push(
      [t("ml / week"), `${decimalFormatter.format(state.mlPerWeek)} ml`, "mlPerWeek"],
      [t("Cost / 10ml"), formatCurrency(state.costPer10ml, state.currencyCode), "costPer10ml"],
      [t("Accessories / mo."), formatCurrency(state.accessoriesPerMonth, state.currencyCode), "accessoriesPerMonth"],
    );
  } else {
    rows.push(
      [t("Cigarettes / day"), numberFormatter.format(state.cigarettesPerDay), "cigarettesPerDay"],
      [t("Pack price"), formatCurrency(state.pricePerPack || 0, state.currencyCode), "pricePerPack"],
    );
    if (!state.notStoppedYet) {
      rows.push([t("Packs not bought"), numberFormatter.format(Math.floor(progress.packsAvoided))]);
    }
  }

  // Still using: the yearly cost is the message, so it belongs on the receipt too.
  const perDay = dailySaving(state);
  if (state.notStoppedYet && perDay > 0) {
    rows.push(
      [t("Costs you per month"), formatCurrency(perDay * 30.4375, state.currencyCode)],
      [t("Costs you per year"), formatCurrency(perDay * 365, state.currencyCode)],
    );
  }

  const cravings = readCravings();
  if (cravings > 0) {
    rows.push([t("Cravings resisted"), numberFormatter.format(cravings)]);
  }

  renderGoal(state);

  if (!state.notStoppedYet && state.mode === "cigarettes") {
    rows.push(
      [t("Estimated life regained*"), formatLifeSaved(progress.estimatedLifeMinutes)],
    );
  }

  renderReceiptRows(rows);
}

function renderSummary(state) {
  const cur = state.currencyCode || "EUR";
  let rows;
  const showAdvancedSpend = state.isAdvanced && Boolean(state.smokingStartDate);
  const advancedProgress = showAdvancedSpend && !state.notStoppedYet ? calculateProgress(state) : null;
  const advancedSpendToday = showAdvancedSpend && state.notStoppedYet
    ? estimateAdvancedSpend(state, new Date())
    : null;
  const advancedData = advancedProgress || advancedSpendToday;
  const dateRows = showAdvancedSpend
    ? state.notStoppedYet
      ? [[t("Start date"), formatDate(state.smokingStartDate)], [t("Status"), t("Still using")]]
      : [[t("Start date"), formatDate(state.smokingStartDate)], [t("Stop date"), formatDate(state.quitDate)]]
    : state.notStoppedYet
    ? [[t("Status"), t("Still using")]]
    : [[t("Quit date"), formatDate(state.quitDate)]];

  if (state.mode === "ryo") {
    rows = [...dateRows];

    rows.push(
      [t("Roll-ups / day"), numberFormatter.format(state.rollsPerDay)],
      [t("Weekly spend"), formatCurrency(state.weeklyRyoCost, cur)],
    );
  } else if (state.mode === "vaping") {
    rows = [...dateRows];

    rows.push(
      [t("ml / week"), decimalFormatter.format(state.mlPerWeek) + " ml"],
      [t("Cost / 10ml"), formatCurrency(state.costPer10ml, cur)],
      [t("Accessories / mo."), formatCurrency(state.accessoriesPerMonth, cur)],
    );
  } else {
    rows = [...dateRows];

    rows.push(
      [t("Cigarettes / day"), numberFormatter.format(state.cigarettesPerDay)],
      [t("Cigarettes / pack"), numberFormatter.format(state.cigarettesPerPack)],
      showAdvancedSpend
        ? [t("Avg pack price"), `~ ${formatCurrency(advancedProgress?.averageHistoricPackPrice ?? advancedData?.averagePackPrice, cur)} ${t("avg DE")}`]
        : [t("Pack price"), formatCurrency(state.pricePerPack, cur)],
    );

    if (showAdvancedSpend) {
      if (advancedProgress) rows.push([t("+ Saved after quit"), `+ ${formatCurrency(advancedProgress.moneySaved, cur)}`]);
      rows.push([state.notStoppedYet ? t("- Paid so far") : t("- Paid before quit"), `- ${formatCurrency(advancedData.moneySpent, cur)}`]);
    }
  }

  if (showAdvancedSpend && state.mode !== "cigarettes") {
    if (advancedProgress) rows.push([t("+ Saved after quit"), `+ ${formatCurrency(advancedProgress.moneySaved, cur)}`]);
    rows.push([state.notStoppedYet ? t("- Paid so far") : t("- Paid before quit"), `- ${formatCurrency(advancedData.moneySpent, cur)}`]);
  }

  if (!elements.summaryList) return;
  elements.summaryList.innerHTML = rows
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");
}

/** Short point in time for a milestone: "20 min", "12 h", "12 wk", "9 mo", "2 yr". */
function formatMilestoneTime(hours) {
  if (hours < 1) return t("{n} min", { n: Math.round(hours * 60) });
  if (hours < 48) return t("{n} h", { n: Math.round(hours) });
  if (hours < 24 * 14) return t("{n} d", { n: Math.round(hours / 24) });
  if (hours < 24 * 7 * 13) return t("{n} wk", { n: Math.round(hours / 168) });
  if (hours < 24 * 365) return t("{n} mo", { n: Math.round(hours / 730) });
  return t("{n} yr", { n: Math.round(hours / 8760) });
}

/** Time left until a milestone, rounded up so it never says "0". */
function formatTimeLeft(hours) {
  if (hours < 1) return t("{n} min", { n: Math.max(1, Math.ceil(hours * 60)) });
  if (hours < 48) return t("{n} h", { n: Math.ceil(hours) });
  const days = Math.ceil(hours / 24);
  if (days < 60) return t("{n} days", { n: days });
  if (days < 730) return t("{n} months", { n: Math.round(days / 30.4) });
  const years = Math.round((days / 365) * 10) / 10;
  return t("{n} years", { n: years.toLocaleString(intlLocale(), { maximumFractionDigits: 1 }) });
}

// ----------------------------------------------------------------- health tab
function renderHealth() {
  const state = getFormState();
  const progress = calculateProgress(state);
  const isVaping = state.mode === "vaping";
  const milestones = isVaping ? vapingMilestones : tobaccoMilestones;
  const elapsed = state.notStoppedYet ? 0 : progress.elapsedHours;
  const result = recoveryProgress(milestones, elapsed);

  document.querySelector("#healthTitle").textContent = isVaping
    ? t("Your vape-free progress")
    : t("Your body is recovering");
  document.querySelector("#healthReached").textContent = t("{n} of {total} reached", { n: result.reached, total: result.total });
  const next = document.querySelector("#healthNext");
  next.textContent = state.notStoppedYet
    ? t("Starts counting on your quit day.")
    : result.next
    ? t("Next: {label}, still {time}", { label: t(result.next.label), time: formatTimeLeft(result.next.hoursLeft) })
    : t("All milestones reached. Amazing.");
  document.querySelector("#healthVapingNote").classList.toggle("is-hidden", !isVaping);

  const list = document.querySelector("#healthList");
  list.innerHTML = "";
  result.items.forEach((item) => {
    const row = document.createElement("li");
    row.className = `health-item${item.done ? " is-done" : ""}`;

    const icon = document.createElement("span");
    icon.className = "health-item__icon";
    icon.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#${item.icon || "i-heart"}"></use></svg>`;

    const head = document.createElement("div");
    head.className = "health-item__head";
    const label = document.createElement("strong");
    label.textContent = t(item.label);
    const percent = document.createElement("span");
    percent.className = "health-item__percent";
    percent.textContent = `${item.percent} %`;
    head.append(label, percent);

    const bar = document.createElement("div");
    bar.className = "health-bar";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", String(item.percent));
    bar.setAttribute("aria-label", t(item.label));
    const fill = document.createElement("span");
    fill.style.width = `${Math.max(item.percent, item.percent > 0 ? 2 : 0)}%`;
    bar.append(fill);

    const detail = document.createElement("p");
    detail.className = "health-item__detail";
    detail.textContent = t(item.detail);

    const status = document.createElement("p");
    status.className = "health-item__status";
    status.textContent = item.done
      ? t("Reached after {time}", { time: formatMilestoneTime(item.hours) })
      : state.notStoppedYet
      ? t("After {time}", { time: formatMilestoneTime(item.hours) })
      : t("Still {time} to go", { time: formatTimeLeft(item.hoursLeft) });

    const body = document.createElement("div");
    body.className = "health-item__body";
    body.append(head, bar, detail, status);
    row.append(icon, body);
    list.append(row);
  });
}

// ----------------------------------------------------------------- today: check-in and tip
// A daily reason to open the app: one tap on how the day went, this week at a glance, a fresh tip.
// No streak that breaks: a missed day simply stays empty.
const checkinFeedback = [
  { text: "Clean day. That is what free feels like.", next: null },
  { text: "Well done. A light urge passes on its own.", next: null },
  { text: "You held on. A plan makes the next one easier.", next: { action: "plan", label: "Plan what you do instead" } },
  { text: "Tough day, and you are still smoke-free. Next time tap SOS right away.", next: { action: "sos", label: "Start SOS" } },
];
const checkinLevelLabels = ["None", "Mild", "Medium", "Strong"];

function readCheckins() {
  return normalizeCheckins(readJSON(CHECKIN_KEY, null));
}

function renderToday() {
  const checkins = readCheckins();
  const todayLevel = checkins[dateKey(new Date())];
  const hasToday = todayLevel !== undefined;

  document.querySelectorAll("#checkinLevels .chip").forEach((chip) => {
    const active = hasToday && Number(chip.dataset.level) === todayLevel;
    chip.classList.toggle("is-active", active);
    chip.setAttribute("aria-pressed", String(active));
  });
  // Before: the question. After: the answer in plain words, and how to change it.
  document.querySelector("#todayQuestion").textContent = hasToday
    ? t("Your urge today: {level}", { level: t(checkinLevelLabels[todayLevel]) })
    : t("How strong was the urge today?");
  document.querySelector("#todayHint").classList.toggle("is-hidden", !hasToday);

  const feedback = document.querySelector("#checkinFeedback");
  const next = document.querySelector("#checkinNext");
  const entry = hasToday ? checkinFeedback[todayLevel] : null;
  feedback.classList.toggle("is-hidden", !entry);
  feedback.textContent = entry ? t(entry.text) : "";
  next.classList.toggle("is-hidden", !entry?.next);
  if (entry?.next) {
    next.textContent = t(entry.next.label);
    next.dataset.action = entry.next.action;
  }

  const week = checkinWeek(checkins);
  renderWeekDays(document.querySelector("#checkinWeek"), week);

}

/** Monday to Sunday as small boxes, filled by how strong the urge was. */
function renderWeekDays(list, week) {
  const dayFormat = new Intl.DateTimeFormat(intlLocale(), { weekday: "short" });
  list.innerHTML = "";
  week.forEach((day) => {
    const item = document.createElement("li");
    const date = new Date(`${day.key}T12:00:00`);
    item.className = [
      "checkin-day",
      day.level !== null ? `is-level-${day.level}` : "",
      day.isToday ? "is-today" : "",
      day.isFuture ? "is-future" : "",
    ].filter(Boolean).join(" ");
    const name = document.createElement("span");
    name.textContent = dayFormat.format(date).replace(".", "");
    const box = document.createElement("i");
    box.setAttribute("aria-hidden", "true");
    item.append(name, box);
    item.setAttribute("aria-label", `${dayFormat.format(date)}: ${day.level !== null ? t(checkinLevelLabels[day.level]) : "–"}`);
    list.append(item);
  });
  const done = week.filter((day) => day.level !== null).length;
  list.dataset.count = t("{n} of 7 days this week", { n: done });
}

// Tapping a check-in notification opens the check-in. Old week-receipt notifications open the start page.
function initNotificationTaps() {
  onNotificationTap((event) => {
    const id = Number(event?.notification?.id);
    if (id >= 7100 && id < 7200) showTab("start");
    else if (id >= 7000 && id < 7100) {
      showTab("start");
      renderToday();
      openSheet(document.querySelector("#todaySheet"));
    }
  });
}

function initToday() {
  document.querySelectorAll("#checkinLevels .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const checkins = readCheckins();
      checkins[dateKey(new Date())] = Number(chip.dataset.level);
      localStorage.setItem(CHECKIN_KEY, JSON.stringify(normalizeCheckins(checkins)));
      mirrorStorage(CHECKIN_KEY);
      haptics.success();
      renderToday();
      updateReceipt(false);
      scheduleReminderSync();
    });
  });
  document.querySelector("#checkinNext").addEventListener("click", (event) => {
    showTab(event.currentTarget.dataset.action);
  });
  document.querySelector("#todayClose").addEventListener("click", () => closeSheet());
  const info = document.querySelector("#todayInfo");
  info.addEventListener("click", () => {
    const open = info.getAttribute("aria-expanded") !== "true";
    info.setAttribute("aria-expanded", String(open));
    document.querySelector("#todayInfoText").classList.toggle("is-hidden", !open);
    haptics.select();
  });
  enableSwipeToClose(document.querySelector("#todaySheet"));
  // "Back to start" links on pages without their own tab.
  document.querySelectorAll(".page-back[data-go]").forEach((link) => {
    link.addEventListener("click", () => { if (!goBack()) showTab(link.dataset.go); });
  });
}

// ----------------------------------------------------------------- "+" action sheet
// Like the create button in social apps: everything you do in the moment, one tap from every page.
function initActions() {
  const sheet = document.querySelector("#actionSheet");
  document.querySelector("#actionButton").addEventListener("click", () => {
    haptics.select();
    openSheet(sheet);
  });
  document.querySelector("#actionClose").addEventListener("click", () => closeSheet());
  sheet.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      closeSheet(false);
      if (action === "sos") showTab("sos");
      if (action === "plan") showTab("plan");
      if (action === "craving" || action === "slip") openDiarySheet(newDiaryEntry(action), { fixedKind: true });
    });
  });
  enableSwipeToClose(sheet);
}

function renderMilestones(elapsedHours, mode) {
  const milestones = mode === "vaping" ? vapingMilestones : tobaccoMilestones;
  const next = milestones.find((m) => m.hours > elapsedHours);
  elements.nextMilestone.classList.toggle("is-hidden", !next);
  elements.nextMilestone.textContent = next
    ? t("Next small-print benefit: {title}", { title: t(next.title) })
    : "";
  elements.milestoneList.innerHTML = "";

  milestones.forEach((milestone) => {
    const isDone = elapsedHours >= milestone.hours;
    const item = document.createElement("li");
    item.className = `milestone${isDone ? " is-done" : ""}`;

    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = t(milestone.title);
    const detail = document.createElement("small");
    detail.textContent = t(milestone.detail);
    copy.append(title, detail);

    const time = document.createElement("span");
    time.textContent = formatMilestoneTime(milestone.hours);
    time.className = "milestone__time";

    const marker = document.createElement("span");
    marker.className = "milestone__marker";
    marker.textContent = isDone ? "+" : "-";

    item.append(copy, time, marker);
    elements.milestoneList.append(item);
  });
}

function updateReceipt(shouldSave = true) {
  const state = getFormState();
  const progress = calculateProgress(state);
  if (shouldSave) writeState(state);
  renderReceipt(progress, state);
  renderSummary(state);
  renderMilestones(progress.elapsedHours, state.mode);
  renderExtrasToggles(state);
  renderInteractive(state, progress);
  renderBoard(state, progress);
  renderStart(state, progress);
}

// ----------------------------------------------------------------- on-board computer
function readBoardPrefs() {
  const raw = readJSON(BOARD_KEY, null) || {};
  return {
    theme: typeof raw.theme === "string" ? raw.theme : "receipt",
    metric: BOARD_METRICS.includes(raw.metric) ? raw.metric : "time",
    // How many unlocked colors the user has already seen; more than that shows "NEW" on the light key.
    // Colors you start with count as seen, so "NEW" only appears for colors earned later.
    seen: Number.isInteger(raw.seen) && raw.seen > 0 ? raw.seen : boardThemeStatus(0).unlocked.length,
  };
}

/** Smoke-free days for the color rewards. */
function boardDays() {
  const state = getFormState();
  return boardData(state, calculateProgress(state)).days;
}

function saveBoardPrefs(prefs) {
  localStorage.setItem(BOARD_KEY, JSON.stringify(prefs));
  mirrorStorage(BOARD_KEY);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

/** Each metric as label, big value and an optional sub line, in the active language. */
function boardTexts(data, state) {
  const currency = state.currencyCode || "EUR";
  const third = data.third;
  const firstDay = data.started && data.days === 0;
  const time = {
    label: t("SMOKE-FREE"),
    value: firstDay ? String(data.hours) : data.years > 0
      ? t("{y}Y {m}M", { y: data.years, m: data.months })
      : String(data.days),
    unit: firstDay ? (data.hours === 1 ? t("HOUR") : t("HOURS")) : data.years > 0 ? "" : (data.days === 1 ? t("DAY") : t("DAYS")),
    sub: !data.started
      ? t("Not quit yet")
      : firstDay
      ? t("Day 1 is running. The first hours count most.")
      : data.years > 0
      ? t("{d} days in total", { d: data.days })
      : data.months > 0
      ? t("{m} MON {d} D {h} H", { m: data.months, d: pad2(data.restDays), h: pad2(data.hours) })
      : t("+{h} H", { h: data.hours }),
  };
  const money = {
    label: t("SAVED"),
    value: formatCurrency(data.money, currency),
    unit: "",
    sub: t("Money not burned"),
  };
  const thirdText = third.kind === "life"
    ? {
      label: t("LIFE BACK*"),
      value: third.days > 0
        ? t("{d}D {h}H", { d: third.days, h: pad2(third.hours) })
        : t("{h}H {m}M", { h: third.hours, m: pad2(third.minutes) }),
      unit: "",
      sub: t("*Estimate: 20 min per cigarette"),
    }
    : third.kind === "rolls"
    ? { label: t("NOT ROLLED"), value: String(third.value), unit: t("PCS"), sub: t("Roll-ups you did not smoke") }
    : { label: t("NOT VAPED"), value: String(third.value), unit: "ML", sub: t("Liquid you did not vape") };
  return { time, money, third: thirdText };
}

const BOARD_BAR_CELLS = 12;

/** One display line: label and goal on top, the big value, a segment bar and what is left. */
function renderBoardLine(el, line) {
  el.innerHTML = "";
  const head = document.createElement("span");
  head.className = "obc__line-head";
  const label = document.createElement("span");
  label.className = "obc__label";
  label.textContent = line.label;
  const goal = document.createElement("span");
  goal.className = "obc__goal";
  goal.textContent = line.goal;
  head.append(label, goal);

  const value = document.createElement("strong");
  value.className = "obc__value";
  value.textContent = line.value;
  value.dataset.size = line.value.length + (line.unit ? line.unit.length : 0) > 9 ? "long" : "short";
  if (line.unit) {
    const unit = document.createElement("small");
    unit.textContent = ` ${line.unit}`;
    value.append(unit);
  }

  const bar = document.createElement("span");
  bar.className = "obc__bar";
  bar.setAttribute("aria-hidden", "true");
  const filled = Math.round(Math.min(1, Math.max(0, line.ratio)) * BOARD_BAR_CELLS);
  for (let i = 0; i < BOARD_BAR_CELLS; i += 1) {
    const cell = document.createElement("i");
    if (i < filled) cell.className = "is-on";
    bar.append(cell);
  }

  const left = document.createElement("span");
  left.className = "obc__left";
  left.textContent = line.left;
  el.append(head, value, bar, left);
  el.setAttribute("aria-label", [line.label, line.value, line.unit, line.goal, line.left].filter(Boolean).join(", "));
}

function goalDays(days) {
  return days === 1 ? t("1 day") : t("{n} days", { n: days });
}

/** Goal names as people say them: "2 years" instead of "730 days", days below one year. */
function goalLabel(days) {
  const years = days / 365.25;
  if (days >= 365 && Math.abs(years - Math.round(years)) < 0.01) {
    const n = Math.round(years);
    return n === 1 ? t("1 year") : t("{n} years", { n });
  }
  return goalDays(Math.round(days));
}

function renderBoard(state, progress) {
  const board = document.querySelector("#board");
  if (!board) return;
  const prefs = readBoardPrefs();
  const data = boardData(state, progress);
  const texts = boardTexts(data, state);
  const goals = boardGoals(state, progress, readGoal());
  const currency = state.currencyCode || "EUR";
  const colors = boardThemeStatus(data.days);
  board.dataset.obcTheme = colors.unlocked.includes(prefs.theme) ? prefs.theme : "receipt";
  const light = document.querySelector("#boardLight");
  const hasNew = colors.unlocked.length > prefs.seen;
  light.classList.toggle("is-new", hasNew);
  light.dataset.badge = t("NEW");
  light.setAttribute("aria-label", hasNew ? t("New display color unlocked") : t("Change display color"));

  const notYet = t("Starts on your quit day");
  renderBoardLine(document.querySelector("#boardTime"), {
    label: texts.time.label,
    value: texts.time.value,
    unit: texts.time.unit,
    goal: t("GOAL {x}", { x: goalDays(goals.time.target) }),
    ratio: goals.time.ratio,
    left: !goals.started ? notYet : goals.time.done ? "" : t("{time} left", { time: formatTimeLeft(goals.time.hoursLeft) }),
  });

  const money = goals.money;
  const moneyLine = document.querySelector("#boardMoney");
  renderBoardLine(moneyLine, {
    label: texts.money.label,
    value: texts.money.value,
    unit: "",
    goal: money.name ? t("GOAL {x}", { x: money.name }) : t("+ SAVINGS GOAL"),
    ratio: money.ratio,
    left: !goals.started ? notYet : money.done ? ""
      : money.name
      ? t("{amount} to go", { amount: formatCurrency(money.left, currency) })
      : t("{amount} to go until {target}", { amount: formatCurrency(money.left, currency), target: formatCurrency(money.target, currency) }),
  });

  const third = goals.third;
  const thirdGoal = data.third.kind === "life"
    ? goalDays(third.target)
    : `${third.target} ${data.third.kind === "rolls" ? t("PCS") : "ML"}`;
  const thirdLeft = data.third.kind === "life"
    ? t("{time} left", { time: formatTimeLeft(third.left * 24) })
    : t("{time} left", { time: `${Math.ceil(third.left)} ${data.third.kind === "rolls" ? t("PCS") : "ML"}` });
  renderBoardLine(document.querySelector("#boardThird"), {
    label: texts.third.label,
    value: texts.third.value,
    unit: texts.third.unit,
    goal: t("GOAL {x}", { x: thirdGoal }),
    ratio: third.ratio,
    left: !goals.started ? notYet : third.done ? "" : thirdLeft,
  });

  document.querySelector("#boardTodayKey").classList.toggle("needs-checkin", !(dateKey(new Date()) in readCheckins()));
}

// ----------------------------------------------------------------- appearance (Auto · Light · Dark)
const APPEARANCE_KEY = "smkfree-appearance";
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

function readAppearance() {
  const value = localStorage.getItem(APPEARANCE_KEY);
  return value === "light" || value === "dark" ? value : "auto";
}

function applyAppearance(value = readAppearance()) {
  const root = document.documentElement;
  if (value === "auto") delete root.dataset.appearance;
  else root.dataset.appearance = value;
  document.querySelectorAll("#appearanceRow [data-appearance]").forEach((button) => {
    button.setAttribute("aria-checked", String(button.dataset.appearance === value));
  });
  setStatusBarDark(value === "dark" || (value === "auto" && systemDark.matches));
  // The color dot in More follows the mode (black ink is white on the dark receipt).
  if (appReady) applyCustomThemeVars(customColorInput.value);
}

function initAppearance() {
  document.querySelectorAll("#appearanceRow [data-appearance]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.appearance;
      if (value === "auto") localStorage.removeItem(APPEARANCE_KEY);
      else localStorage.setItem(APPEARANCE_KEY, value);
      mirrorStorage(APPEARANCE_KEY);
      haptics.select();
      applyAppearance(value);
    });
  });
  // On "Auto", follow the phone when it switches (e.g. at sunset).
  systemDark.addEventListener?.("change", () => applyAppearance());
  applyAppearance();
}

// ----------------------------------------------------------------- native start page
const RING_RADII = [88, 64, 40];
const RING_WIDTH = 20;

function ringSvg(ratios) {
  const parts = RING_RADII.map((radius, index) => {
    const circumference = 2 * Math.PI * radius;
    const ratio = Math.min(1, Math.max(0, ratios[index] || 0));
    const visible = ratio > 0 ? Math.max(ratio, 0.02) : 0;
    const offset = circumference * (1 - visible);
    const cls = `ring--${index + 1}`;
    return `<circle class="ring-track ${cls}" cx="100" cy="100" r="${radius}" stroke-width="${RING_WIDTH}"></circle>`
      + `<circle class="ring-fill ${cls}" cx="100" cy="100" r="${radius}" stroke-width="${RING_WIDTH}" stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"></circle>`;
  });
  return `<svg viewBox="0 0 200 200" aria-hidden="true">${parts.join("")}</svg>`;
}

function miniRingSvg(filled) {
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  return `<svg viewBox="0 0 34 34" aria-hidden="true">`
    + `<circle cx="17" cy="17" r="${radius}" fill="none" stroke="var(--ring-2)" stroke-width="5" opacity="0.22"></circle>`
    + (filled ? `<circle cx="17" cy="17" r="${radius}" fill="none" stroke="var(--ring-2)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="0" transform="rotate(-90 17 17)"></circle>` : "")
    + `</svg>`;
}

function renderMetric(el, { label, value, sub }) {
  el.innerHTML = "";
  const l = document.createElement("span");
  l.className = "ios-metric__label";
  l.textContent = label;
  const v = document.createElement("span");
  v.className = "ios-metric__value";
  v.textContent = value;
  const s2 = document.createElement("span");
  s2.className = "ios-metric__sub";
  s2.textContent = sub;
  el.append(l, v, s2);
  el.setAttribute("aria-label", `${label}: ${value}. ${sub}`);
}

function startValues(data) {
  const firstDay = data.started && data.days === 0;
  const time = firstDay
    ? t("{n} h", { n: data.hours })
    : data.years > 0
    ? t("{y} yr {m} mo", { y: data.years, m: data.months })
    : data.days === 1 ? t("1 day") : t("{n} days", { n: data.days });
  const third = data.third;
  // Short on the card (it is half a phone wide), the exact value is in the info sheet.
  const thirdValue = third.kind === "life"
    ? third.days >= 365 ? t("{y} yr {m} mo", { y: Math.floor(third.days / 365), m: Math.floor((third.days % 365) / 30.4) })
    : third.days >= 100 ? t("{n} days", { n: third.days })
    : third.days > 0 ? t("{d} d {h} h", { d: third.days, h: third.hours }) : t("{h} h {m} min", { h: third.hours, m: third.minutes })
    : third.kind === "rolls" ? t("{n} roll-ups", { n: numberFormatter.format(third.value) }) : `${numberFormatter.format(third.value)} ml`;
  return { time, thirdValue };
}

/** Like Apple Health: the numbers large, units (€, Tage, Std.) smaller and quieter. */
function setValueWithUnits(el, text) {
  el.textContent = "";
  String(text).split(/([0-9][0-9.,]*)/).forEach((part) => {
    if (!part) return;
    if (/^[0-9]/.test(part)) el.append(part);
    else {
      const unit = document.createElement("small");
      unit.className = "value-unit";
      unit.textContent = part;
      el.append(unit);
    }
  });
  el.setAttribute("aria-label", String(text));
}

function renderStart(state, progress) {
  const page = document.querySelector("#startPage");
  if (!page || !document.querySelector("#gauge")) return;
  const data = boardData(state, progress);
  const goals = boardGoals(state, progress, readGoal());
  const currency = state.currencyCode || "EUR";
  const values = startValues(data);
  const notYet = t("Starts on your quit day");

  document.querySelector("#startDate").textContent = new Intl.DateTimeFormat(intlLocale(), {
    weekday: "long", day: "numeric", month: "long",
  }).format(new Date());

  // Gauge: from the last milestone to the next one.
  const time = goals.time;
  const pct = Math.round(Math.min(1, Math.max(0, time.ratio)) * 100);
  document.querySelector("#gaugeFill").setAttribute("stroke-dasharray", `${pct > 0 ? Math.max(pct, 1.5) : 0} 100`);
  setValueWithUnits(document.querySelector("#gaugeValue"), values.time);
  document.querySelector("#gaugeSub").textContent = !goals.started ? notYet : time.done ? "" : t("{time} until {goal}", {
    time: formatTimeLeft(time.hoursLeft), goal: goalLabel(time.target),
  });
  document.querySelector("#gaugeFrom").textContent = time.from === 0 ? t("Quit day") : goalLabel(time.from);
  document.querySelector("#gaugeTo").textContent = goalLabel(time.target);
  // Long values ("12 yr 11 mo") get a smaller size so they stay inside the arc.
  document.querySelector("#gaugeValue").dataset.size = values.time.length > 10 ? "long" : values.time.length > 7 ? "mid" : "";
  document.querySelector("#gauge").setAttribute("aria-label", `${t("Smoke-free")}: ${values.time}. ${document.querySelector("#gaugeSub").textContent}`);

  // Money card (tap: savings goal) and life card.
  const money = goals.money;
  setValueWithUnits(document.querySelector("#statMoney"), formatCurrency(data.money, currency));
  document.querySelector("#statMoney").classList.toggle("is-long", formatCurrency(data.money, currency).length > 9);
  document.querySelector("#statMoneyBar").style.width = `${Math.round(Math.min(1, money.ratio) * 100)}%`;
  document.querySelector("#statMoneySub").textContent = !goals.started ? notYet : money.done ? ""
    : money.name ? t("{amount} to {goal}", { amount: formatCurrency(money.left, currency), goal: money.name })
    : t("{amount} to {goal}", { amount: formatCurrency(money.left, currency), goal: formatCurrency(money.target, currency) });
  const third = goals.third;
  document.querySelector("#statThirdLabel").textContent = data.third.kind === "life" ? t("Life back*") : data.third.kind === "rolls" ? t("Not rolled") : t("Not vaped");
  setValueWithUnits(document.querySelector("#statThird"), values.thirdValue);
  document.querySelector("#statThird").classList.toggle("is-long", values.thirdValue.length > 9);
  document.querySelector("#statThirdBar").style.width = `${Math.round(Math.min(1, third.ratio) * 100)}%`;
  document.querySelector("#statThirdSub").textContent = !goals.started ? notYet : third.done ? ""
    : data.third.kind === "life" ? t("{time} until {goal}", { time: formatTimeLeft(third.left * 24), goal: goalLabel(third.target) })
    : t("{time} until {goal}", { time: `${Math.ceil(third.left)}`, goal: `${third.target}` });

  // Check-in row: status and this week as dots.
  const checkins = readCheckins();
  const checkedIn = dateKey(new Date()) in checkins;
  document.querySelector("#boardTodayKey").classList.toggle("needs-checkin", !checkedIn);
  document.querySelector("#checkinRowTitle").textContent = checkedIn
    ? t("Check-in done · {level}", { level: t(checkinLevelLabels[checkins[dateKey(new Date())]]) })
    : t("Check in for today");
  const dots = document.querySelector("#checkinRowDots");
  dots.innerHTML = "";
  // This week as small bars like in Apple Health: height and traffic-light color show how strong the urge was.
  checkinWeek(checkins).forEach((day) => {
    const bar = document.createElement("i");
    bar.className = [day.level !== null ? `is-on is-level-${day.level}` : "", day.isToday ? "is-today" : ""].filter(Boolean).join(" ");
    dots.append(bar);
  });

  // Body card: the most recent reached milestone and the next ones, three at most.
  const milestones = state.mode === "vaping" ? vapingMilestones : tobaccoMilestones;
  const health = recoveryProgress(milestones, state.notStoppedYet ? 0 : progress.elapsedHours);
  document.querySelector("#bodyCardCount").textContent = t("{n} of {total} reached", { n: health.reached, total: health.total });
  const lastDone = health.items.filter((item) => item.done).slice(-1);
  const upcoming = health.items.filter((item) => !item.done).slice(0, 3 - lastDone.length);
  const bodyList = document.querySelector("#bodyCardList");
  bodyList.innerHTML = "";
  [...lastDone, ...upcoming].forEach((item) => {
    const row = document.createElement("span");
    row.className = `body-row${item.done ? " is-done" : ""}`;
    row.innerHTML = `<span class="body-row__icon"><svg class="icon" aria-hidden="true"><use href="#${item.icon || "i-heart"}"></use></svg></span>`
      + `<span class="body-row__main"><span class="body-row__top"><span class="body-row__label"></span><span class="body-row__pct"></span></span>`
      + `<span class="body-row__bar"><i style="width:${item.percent}%"></i></span></span>`;
    row.querySelector(".body-row__label").textContent = t(item.label);
    row.querySelector(".body-row__pct").textContent = item.done ? "✓" : `${item.percent} %`;
    bodyList.append(row);
  });

  // Colors: accent palettes unlock on smoke-free days.
  const prefs = readBoardPrefs();
  const colors = boardThemeStatus(data.days);
  page.dataset.palette = colors.unlocked.includes(prefs.theme) ? prefs.theme : "receipt";
  const colorTile = document.querySelector("#boardLight");
  const hasNew = colors.unlocked.length > prefs.seen;
  colorTile.classList.toggle("is-new", hasNew);
  colorTile.dataset.badge = t("NEW");
  // The badge already says NEW, the subtitle always shows the count.
  document.querySelector("#tileColorSub").textContent = t("{n} of {total}", { n: colors.unlocked.length, total: colors.total });
}

// ----------------------------------------------------------------- life back info
// What the third start card means and where the number comes from, in three short lines.
function openLifeSheet() {
  const state = getFormState();
  const progress = calculateProgress(state);
  const data = boardData(state, progress);
  const goals = boardGoals(state, progress, readGoal());
  const third = data.third;
  const rows = [];
  let kicker;
  let value;
  let lead;
  let note;
  if (third.kind === "life") {
    kicker = t("Life back");
    value = third.days > 0 ? t("{d} d {h} h", { d: numberFormatter.format(third.days), h: third.hours }) : t("{h} h {m} min", { h: third.hours, m: third.minutes });
    lead = t("On average, every cigarette costs about 20 minutes of life. These are the minutes from the cigarettes you did not smoke.");
    rows.push([t("Cigarettes not smoked"), numberFormatter.format(Math.floor(progress.cigarettesAvoided || 0))]);
    rows.push([t("Per cigarette"), t("about 20 min")]);
    note = t("*An average across many people (UCL study, 2025), not a forecast for you personally. Sources in the legal notes.");
  } else if (third.kind === "rolls") {
    kicker = t("Not rolled");
    value = t("{n} roll-ups", { n: numberFormatter.format(third.value) });
    lead = t("Roll-ups you did not smoke since your quit day, based on your daily amount.");
    rows.push([t("Roll-ups per day"), numberFormatter.format(Number(state.rollsPerDay) || 0)]);
    note = t("Health research on life expectancy exists for factory cigarettes only, so roll-ups show what you did not use.");
  } else {
    kicker = t("Not vaped");
    value = `${numberFormatter.format(third.value)} ml`;
    lead = t("Liquid you did not vape since your quit day, based on your weekly amount.");
    rows.push([t("ml / week"), `${numberFormatter.format(Number(state.mlPerWeek) || 0)} ml`]);
    note = t("For vaping there is too little long-term data for a life-expectancy estimate, so you see what you did not use.");
  }
  if (goals.started && !goals.third.done) {
    const next = third.kind === "life" ? goalLabel(goals.third.target) : numberFormatter.format(goals.third.target);
    rows.push([t("Next goal"), next]);
  }
  document.querySelector("#lifeSheetKicker").textContent = kicker;
  setValueWithUnits(document.querySelector("#lifeSheetValue"), data.started ? value : "--");
  document.querySelector("#lifeSheetLead").textContent = data.started ? lead : t("Starts on your quit day");
  const list = document.querySelector("#lifeSheetRows");
  list.innerHTML = "";
  rows.forEach(([label, text]) => {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = text;
    row.append(dt, dd);
    list.append(row);
  });
  document.querySelector("#lifeSheetNote").textContent = note;
  openSheet(document.querySelector("#lifeSheet"));
}

function initBoard() {
  // Share from the start page: the receipt is what gets shared, so it opens and shares right away.
  document.querySelector("#startShare").addEventListener("click", () => {
    haptics.select();
    openShareSheet();
  });
  document.querySelector("#lifeSheetClose").addEventListener("click", () => closeSheet());
  enableSwipeToClose(document.querySelector("#lifeSheet"));
  const board = document.querySelector("#board") || document.querySelector("#startPage");
  board.addEventListener("click", (event) => {
    const target = event.target.closest("#boardLight, #boardMoney, #boardLife, [data-go]");
    if (!target) return;
    haptics.select();
    if (target.dataset.go) {
      if (target.dataset.go === "today") {
        renderToday();
        openSheet(document.querySelector("#todaySheet"));
      } else if (target.dataset.go === "receipt") {
        // "Receipt" prints a fresh one, like the till: the receipt tab with the print animation.
        showTab("receipt");
        printReceipt();
      } else {
        showTab(target.dataset.go);
      }
      return;
    }
    const prefs = readBoardPrefs();
    if (target.id === "boardLight") {
      const colors = boardThemeStatus(boardDays());
      if (colors.unlocked.length > prefs.seen) {
        // Reward first: jump straight to the newest color.
        prefs.theme = colors.unlocked[colors.unlocked.length - 1];
        prefs.seen = colors.unlocked.length;
        haptics.success();
        showToast(t("New display color unlocked"));
      } else {
        const index = (colors.unlocked.indexOf(prefs.theme) + 1) % colors.unlocked.length;
        prefs.theme = colors.unlocked[index];
        if (index === 0 && colors.next) showToast(t("Next color on day {day}", { day: colors.next.day }));
      }
    } else if (target.id === "boardMoney") {
      // The money line opens the savings goal: set one, or change it.
      document.querySelector("#goalButton").click();
      return;
    } else if (target.id === "boardLife") {
      openLifeSheet();
      return;
    }
    saveBoardPrefs(prefs);
    updateReceipt(false);
  });
  // A short display test when the app opens, like a car's dashboard at ignition.
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    board.classList.add("is-booting");
    window.setTimeout(() => board.classList.remove("is-booting"), 900);
  }
}

function downloadUrl(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Could not create receipt image."));
    }, "image/png");
  });
}

/** True when the app currently shows dark mode (setting "Dark", or "Auto" on a dark phone). */
function isDarkMode() {
  const setting = document.documentElement.dataset.appearance;
  return setting === "dark" || (setting !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

/** The receipt ink lightened for dark mode as a plain hex color (same hue, high lightness). */
function darkReceiptInk() {
  const receipt = elements.receipt;
  if (!receipt.dataset.theme) return "#ffffff";
  const raw = getComputedStyle(receipt).getPropertyValue("--ink").trim();
  if (!/^#[0-9a-f]{6}$/i.test(raw)) return "#ffffff";
  const { h, s } = hexToHsl(raw);
  if (s < 0.05) return "#ffffff";
  return hslToHex(h, Math.min(1, s * 1.1), 0.72);
}

async function createReceiptImageBlob() {
  const dark = isDarkMode();
  elements.receipt.classList.add("is-capturing");
  // The image library cannot read modern color functions, so the dark ink is passed as plain hex.
  if (dark) {
    elements.receipt.classList.add("is-capturing-dark");
    elements.receipt.style.setProperty("--receipt-ink-dark", darkReceiptInk());
  }
  try {
    const canvas = await html2canvas(elements.receipt, {
      backgroundColor: dark ? "#1c1c1e" : "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
    });
    return canvasToBlob(canvas);
  } finally {
    elements.receipt.classList.remove("is-capturing", "is-capturing-dark");
    elements.receipt.style.removeProperty("--receipt-ink-dark");
  }
}

// ----------------------------------------------------------------- sharing
// Three choices: a compact square card (fits a WhatsApp or iMessage bubble without cropping),
// the whole receipt, or only the app link without any of your numbers.
const SHARE_LINK = "https://moritz249.github.io/smkfree/";
const SHARE_WIDTH = 1200;
const SHARE_HEIGHT = 960; // 5:4, a little wider than tall: shown whole in WhatsApp and iMessage
const SHARE_RECEIPT_CSS_WIDTH = 600;

/**
 * The short receipt: the real receipt (same font, logo, color, light or dark), cut after the total
 * and laid out wider than on the phone, then placed on a 5:4 picture.
 */
async function createCompactReceiptBlob() {
  const dark = isDarkMode();
  const host = document.createElement("div");
  host.className = "share-capture";
  host.style.width = `${SHARE_RECEIPT_CSS_WIDTH}px`;
  const clone = elements.receipt.cloneNode(true);
  clone.removeAttribute("id");
  clone.classList.add("is-capturing", "receipt--compact");
  if (dark) {
    clone.classList.add("is-capturing-dark");
    clone.style.setProperty("--receipt-ink-dark", darkReceiptInk());
  }
  // Keep the top: header, divider, days and the total. Everything below stays on the full receipt.
  const total = clone.querySelector(".receipt__total");
  let next = total?.nextElementSibling;
  while (next) {
    const after = next.nextElementSibling;
    next.remove();
    next = after;
  }
  const link = document.createElement("p");
  link.className = "receipt-compact__link";
  link.textContent = SHARE_LINK.replace("https://", "").replace(/\/$/, "");
  clone.append(link);
  host.append(clone);
  document.body.append(host);
  try {
    const background = dark ? "#1c1c1e" : "#ffffff";
    const shot = await html2canvas(clone, {
      backgroundColor: background,
      scale: 3,
      useCORS: true,
      logging: false,
      allowTaint: true,
    });
    // Center the receipt on the 5:4 picture, scaled to fit with a margin.
    const canvas = document.createElement("canvas");
    canvas.width = SHARE_WIDTH;
    canvas.height = SHARE_HEIGHT;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = dark ? "#000000" : "#f2f2f7";
    ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT);
    const margin = 48;
    const fit = Math.min((SHARE_WIDTH - margin * 2) / shot.width, (SHARE_HEIGHT - margin * 2) / shot.height);
    const w = shot.width * fit;
    const h = shot.height * fit;
    const x = (SHARE_WIDTH - w) / 2;
    const y = (SHARE_HEIGHT - h) / 2;
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 28);
    else ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(shot, x, y, w, h);
    ctx.restore();
    return canvas;
  } finally {
    host.remove();
  }
}

/** Hands an image to the share sheet (app: native sheet, web: Web Share, else a download). */
async function shareImage(blob, filename) {
  const title = t("SMKFREE Quit Receipt");
  // The link goes inside the text: WhatsApp and iMessage keep it as the caption under the picture.
  const text = `${shareText()} ${SHARE_LINK}`;
  if (isNativeApp && await shareImageNative(blob, { title, text, filename })) return "shared";

  const file = new File([blob], filename, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({ title, text, files: [file] });
      return "shared";
    } catch (error) {
      if (error?.name === "AbortError") throw error;
    }
  }
  const objectUrl = URL.createObjectURL(blob);
  downloadUrl(objectUrl, filename);
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  return "downloaded";
}

async function shareReceiptImage() {
  return shareImage(await createReceiptImageBlob(), "smkfree-receipt.png");
}

/** Only the app: a link and one line, none of your numbers. The chat shows the link preview. */
async function shareAppOnly() {
  const title = "SMKFREE";
  const text = t("SMKFREE helps me stay smoke-free. No account, everything stays on your phone.");
  if (isNativeApp && await shareLinkNative({ title, text, url: SHARE_LINK })) return "shared";
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: SHARE_LINK });
      return "shared";
    } catch (error) {
      if (error?.name === "AbortError") throw error;
    }
  }
  await navigator.clipboard?.writeText(`${text} ${SHARE_LINK}`);
  return "copied";
}

let shareCardBlob = null;

function openShareSheet() {
  const preview = document.querySelector("#sharePreview");
  preview.removeAttribute("src");
  preview.classList.add("is-loading");
  // Ready before the tap, so sharing starts right away (browsers only allow it straight after a tap).
  const canvasReady = createCompactReceiptBlob();
  shareCardBlob = canvasReady.then(canvasToBlob);
  canvasReady.then((canvas) => {
    preview.src = canvas.toDataURL("image/png");
    preview.classList.remove("is-loading");
  }).catch(() => preview.classList.remove("is-loading"));
  openSheet(document.querySelector("#shareSheet"));
}

async function runShare(kind) {
  closeSheet(false);
  try {
    let result;
    if (kind === "card") result = await shareImage(await shareCardBlob, "smkfree.png");
    else if (kind === "app") result = await shareAppOnly();
    else {
      // The whole receipt is captured from the page, so it has to be on screen.
      if (activeTab !== "receipt") {
        showTab("receipt");
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }
      result = await shareReceiptImage();
    }
    if (result === "shared") haptics.success();
    if (result === "downloaded") showToast(t("Image saved"));
    if (result === "copied") showToast(t("Link copied"));
  } catch (error) {
    if (error?.name !== "AbortError") showToast(t("Share failed"));
  }
}

function initShareSheet() {
  const sheet = document.querySelector("#shareSheet");
  sheet.querySelectorAll("[data-share]").forEach((button) => {
    button.addEventListener("click", () => runShare(button.dataset.share));
  });
  document.querySelector("#shareClose").addEventListener("click", () => closeSheet());
  enableSwipeToClose(sheet);
}


function showStep(index, direction = 0) {
  const activeSteps = getActiveSteps();
  const previousStep = currentStep;
  currentStep = Math.min(Math.max(index, 0), activeSteps.length - 1);
  elements.steps.forEach((step) => step.classList.remove("is-active", "slide-in-left", "slide-in-right"));
  activeSteps[currentStep].classList.add("is-active");
  prefillStepDefaults(activeSteps[currentStep]);
  const slide = direction || Math.sign(currentStep - previousStep);
  if (slide) {
    activeSteps[currentStep].classList.add(slide > 0 ? "slide-in-right" : "slide-in-left");
    haptics.select();
  }
  updateModeCards();

  const total = activeSteps.length;
  const progress = Math.round(((currentStep + 1) / total) * 100);
  const secondsLeft = Math.max(0, (total - currentStep - 1) * 5);
  elements.stepCounter.textContent = t("Step {n} of {total}", { n: currentStep + 1, total });
  // Reset only matters once there is something to reset.
  elements.resetButton.classList.toggle("is-hidden", localStorage.getItem(STORAGE_KEY) === null);
  elements.progressFill.style.width = `${progress}%`;
  elements.progressPercent.textContent = secondsLeft > 0 && currentStep > 0
    ? t("~{s} sec left", { s: secondsLeft })
    : `${progress}%`;
  elements.backButton.disabled = currentStep === 0;
  elements.backButton.classList.toggle("is-hidden", currentStep === 0);
  elements.nextButton.textContent = currentStep === 0 ? t("Start") : t("Next");
  elements.nextButton.classList.toggle("is-hidden", currentStep === total - 1);
  elements.receiptButton.classList.toggle("is-hidden", currentStep !== total - 1);
  elements.siteFooter.classList.toggle("is-hidden", currentStep !== 0);
  // On touch devices, auto-focusing pops the keyboard over the step; only do it with a mouse.
  if (!isTouchDevice) window.setTimeout(focusCurrentStepField, 0);
}

/**
 * Grey example numbers looked like real values, yet "Print my receipt" still asked to fill them in.
 * Empty consumption fields now start with the typical value, so one tap is enough and +/- works from there.
 */
function prefillStepDefaults(stepEl) {
  stepEl.querySelectorAll("input[placeholder]").forEach((input) => {
    if (input.value !== "" || input.type === "date") return;
    if (decimalInputIds.has(input.id)) {
      const value = parseDecimal(input.placeholder);
      if (value !== null) input.value = formatMoneyInput(value);
    } else if (input.type === "number") {
      const value = Number(input.placeholder);
      if (Number.isFinite(value)) input.value = String(value);
    }
  });
}

function focusCurrentStepField() {
  const activeSteps = getActiveSteps();
  const field = getStepFields(activeSteps[currentStep])[0];
  if (field) { field.focus(); return; }
  if (currentStep === activeSteps.length - 1) elements.receiptButton.focus();
}

function getStepFields(stepEl) {
  return [...stepEl?.querySelectorAll("input:not([type='radio']), select") || []]
    .filter((field) => !field.disabled && !field.closest(".is-hidden"));
}

function validateCurrentStep() {
  const activeSteps = getActiveSteps();
  const stepEl = activeSteps[currentStep];

  if (stepEl.querySelector("input[name='mode']")) return !!currentMode;
  if (stepEl.contains(elements.quitDate)) {
    if (elements.notStoppedYet.checked) {
      setQuitDateError("");
      return true;
    }

    const message = elements.quitDate.value ? "" : t("Please enter a quit date.");
    setQuitDateError(message);
    if (message) {
      elements.quitDate.reportValidity();
      return false;
    }
  }

  const inputs = getStepFields(stepEl);
  return inputs.every((input) => {
    if (input === elements.smokingStartDate) {
      const needsStartDate = currentAdvanced && supportsAdvancedMode(currentMode);
      const isValid = !needsStartDate || (input.value && (!elements.quitDate.value || input.value < elements.quitDate.value));
      input.setCustomValidity(isValid ? "" : t("Enter a start date before your quit date."));
    }

    if (decimalInputIds.has(input.id)) {
      const value = parseDecimal(input.value);
      const isValid = value !== null && value >= 0;
      input.setCustomValidity(isValid ? "" : t("Enter a valid amount."));
    }
    return input.reportValidity();
  });
}

function showReceipt(event, { animate = true, tab = "receipt" } = {}) {
  event?.preventDefault();
  event?.stopPropagation();
  document.activeElement?.blur?.();
  // Mark the receipt view first, so the save below records the setup as finished.
  elements.appShell.classList.add("is-receipt-view");
  elements.stage.classList.add("is-receipt-only");
  setActiveTab(tab);
  syncReceiptHint();
  updateReceipt();
  setButtonLabel(elements.editButton, t("Edit details"));
  elements.siteFooter.classList.add("is-hidden");
  if (animate) printReceipt();
  window.scrollTo({ top: 0, behavior: "smooth" });
  showReceiptInstallRow();
  startReceiptRefresh();
}

function startReceiptRefresh() {
  if (receiptRefreshTimer) return;
  receiptRefreshTimer = window.setInterval(() => {
    if (!elements.stage.classList.contains("is-receipt-only")) return;
    updateReceipt(false);
    if (activeTab === "health") renderHealth();
  }, 60_000);
}

function stopReceiptRefresh() {
  if (!receiptRefreshTimer) return;
  window.clearInterval(receiptRefreshTimer);
  receiptRefreshTimer = null;
}

function advanceWizard() {
  if (!validateCurrentStep()) return;
  updateReceipt();

  const activeSteps = getActiveSteps();
  if (currentStep < activeSteps.length - 1) {
    showStep(currentStep + 1);
    return;
  }

  showReceipt();
}

function handleNotStoppedYet() {
  syncNotStoppedFields();
  updateReceipt();
}

function focusNextFieldInStep(target) {
  const activeSteps = getActiveSteps();
  const fields = getStepFields(activeSteps[currentStep]);
  const fieldIndex = fields.indexOf(target);

  if (fieldIndex < 0 || fieldIndex >= fields.length - 1) {
    return false;
  }

  const currentField = fields[fieldIndex];

  if (!currentField.reportValidity()) {
    return true;
  }

  updateReceipt();
  fields[fieldIndex + 1].focus();
  return true;
}

function resetApp() {
  haptics.warning();
  closeSheet(false);
  [STORAGE_KEY, THEME_KEY, CUSTOM_COLOR_KEY, GOAL_KEY, REMINDERS_KEY, CRAVINGS_KEY, PLAN_KEY, HINT_KEY, DIARY_KEY, SHARE_PROMPT_KEY, DEV_TYPE_KEY, BOARD_KEY, CHECKIN_KEY, WEEK_SEEN_KEY]
    .forEach((key) => localStorage.removeItem(key));
  mirrorAllStorage();
  applyDevType(readDevType());
  replaceScheduledNotifications([]);

  stopReceiptRefresh();
  elements.stage.classList.remove("is-receipt-only");
  elements.appShell.classList.remove("is-receipt-view");
  if (receiptInstallRow) receiptInstallRow.classList.add("is-hidden");

  const defaultState = readState();
  setFormState(defaultState);
  setQuitDateError("");
  customColorInput.value = "#7c3aed";
  receiptColorInput.value = "#7c3aed";
  applyCustomThemeVars(customColorInput.value);
  applyTheme("default");
  updateReceipt(false);
  leaveEditing();
  showStep(0);
  // Clear the quick-pick highlight too, or "1 month ago" stays ticked next to an empty date.
  syncDateChips();
  elements.appShell.scrollIntoView({ behavior: "smooth", block: "start" });
  showToast(t("All data deleted"));
}

// Mode radio change
elements.modeRadios.forEach((radio) => {
  radio.addEventListener("input", () => {
    currentMode = radio.value;
    elements.form.dataset.mode = currentMode;
    syncAdvancedFields();
    updateModeCards();
    updateReceipt();
    showStep(currentStep);
  });
});

elements.advancedMode.addEventListener("input", () => {
  currentAdvanced = elements.advancedMode.checked && supportsAdvancedMode(currentMode);
  syncAdvancedFields();
  updateReceipt();
});

elements.showBenefitsToggle.addEventListener("input", () => {
  currentShowBenefits = elements.showBenefitsToggle.checked;
  syncBenefitsVisibility();
  updateReceipt();
});

elements.quitDate.addEventListener("input", () => {
  if (elements.quitDate.value) setQuitDateError("");
  syncAdvancedFields();
});

elements.currencyCodes.forEach((select) => {
  select.addEventListener("change", () => {
    updateCurrencySymbols(select.value);
    updateReceipt();
  });
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  advanceWizard();
});

elements.form.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  if (focusNextFieldInStep(event.target)) return;
  advanceWizard();
});

elements.nextButton.addEventListener("click", () => {
  advanceWizard();
});

elements.notStoppedYet.addEventListener("input", handleNotStoppedYet);
elements.backButton.addEventListener("click", () => showStep(currentStep - 1));
elements.receiptButton.addEventListener("click", (event) => {
  if (isEditing()) {
    if (!validateAllSteps()) return;
    leaveEditing();
    showReceipt(event, { animate: false, tab: "start" });
    showToast(t("Changes saved"));
    return;
  }
  // The last data step prints directly, so it still has to be valid.
  if (!validateCurrentStep()) return;
  showReceipt(event);
});
elements.resetButton.addEventListener("click", () => {
  haptics.warning();
  openSheet(elements.resetSheet);
});
document.querySelector("#resetCancel").addEventListener("click", () => closeSheet());
document.querySelector("#resetConfirm").addEventListener("click", resetApp);
elements.form.addEventListener("input", () => updateReceipt());
elements.editButton.addEventListener("click", () => {
  elements.stage.classList.remove("is-receipt-only");
  elements.appShell.classList.remove("is-receipt-view");
  setButtonLabel(elements.editButton, t("Edit details"));
  stopReceiptRefresh();
  // Editing is one page with every field, not the step-by-step onboarding.
  elements.form.classList.add("is-editing");
  elements.form.dataset.mode = currentMode;
  setButtonLabel(elements.receiptButton, t("Save"));
});

function isEditing() {
  return elements.form.classList.contains("is-editing");
}

/** In edit mode every visible step is checked, not only the current one. */
function validateAllSteps() {
  const saved = currentStep;
  const steps = getActiveSteps();
  for (let index = 0; index < steps.length; index += 1) {
    currentStep = index;
    if (!validateCurrentStep()) {
      currentStep = saved;
      return false;
    }
  }
  currentStep = saved;
  return true;
}

function leaveEditing() {
  elements.form.classList.remove("is-editing");
  setButtonLabel(elements.receiptButton, t("Print my receipt"));
}
elements.downloadButton.addEventListener("click", openShareSheet);

window.addEventListener("pagehide", saveCurrentState);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  if (elements.stage.classList.contains("is-receipt-only")) updateReceipt(false);
});

// Theme
const THEME_KEY = "smkfree-theme";

function applyTheme(theme) {
  elements.receipt.dataset.theme = theme === "default" ? "" : theme;
}

// Custom color theme
const CUSTOM_COLOR_KEY = "smkfree-custom-color";
const customColorInput = document.querySelector("#customColor");
const customColorLabel = document.querySelector("#customColorLabel");

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (delta > 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / delta + 6) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h /= 6;
  }
  return { h, s, l };
}

function hslToHex(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h * 12) % 12;
    return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)))
      .toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function applyCustomThemeVars(hex) {
  const { h, s, l } = hexToHsl(hex);
  // Strong ink: saturated and not too dark, still well readable on the light paper.
  const inkL = Math.min(l, 0.43);
  const inkS = s < 0.05 ? s : Math.max(s, 0.72);
  const inkHex    = hslToHex(h, inkS, inkL);
  const mutedHex  = hslToHex(h, inkS * 0.65, Math.min(inkL + 0.22, 0.65));
  const paperHex  = hslToHex(h, Math.min(s * 0.8 + 0.1, 0.55), 0.964);
  const receiptHex = hslToHex(h, Math.min(s * 0.4 + 0.05, 0.25), 0.987);
  const dotBgHex  = hslToHex(h, Math.max(s, 0.5), Math.min(Math.max(l + 0.1, 0.58), 0.76));
  const ri = parseInt(inkHex.slice(1, 3), 16);
  const gi = parseInt(inkHex.slice(3, 5), 16);
  const bi = parseInt(inkHex.slice(5, 7), 16);

  const el = elements.receipt;
  // Black or grey ink turns white on the dark receipt, not grey.
  el.dataset.ink = s < 0.05 ? "neutral" : "";
  el.style.setProperty("--custom-ink", inkHex);
  el.style.setProperty("--custom-muted", mutedHex);
  el.style.setProperty("--custom-paper", paperHex);
  el.style.setProperty("--custom-receipt", receiptHex);
  el.style.setProperty("--custom-shadow", `8px 10px 0 rgba(${ri}, ${gi}, ${bi}, 0.35)`);

  [document.querySelector("#colorSwatch")].forEach((swatch) => {
    if (!swatch) return;
    // Black ink shows white on the dark receipt, so the menu dot does too.
    const neutralDark = s < 0.05 && isDarkMode();
    swatch.style.background = neutralDark ? "#f2f2f7" : dotBgHex;
    swatch.style.borderColor = neutralDark ? "#f2f2f7" : inkHex;
  });
}

const receiptColorInput = document.querySelector("#receiptColor");

function onColorChange(event) {
  // The menu and the dot on the receipt are two pickers for the same color.
  if (event?.target === receiptColorInput) customColorInput.value = receiptColorInput.value;
  const hex = customColorInput.value;
  receiptColorInput.value = hex;
  applyCustomThemeVars(hex);
  localStorage.setItem(CUSTOM_COLOR_KEY, hex);
  localStorage.setItem(THEME_KEY, "custom");
  mirrorStorage(CUSTOM_COLOR_KEY);
  mirrorStorage(THEME_KEY);
  applyTheme("custom");
}

// ----------------------------------------------------------------- receipt color sheet
const receiptColorNames = [
  { id: "black", label: "Black" },
  { id: "blue", label: "Blue" },
  { id: "red", label: "Red" },
  { id: "green", label: "Green" },
  { id: "purple", label: "Purple" },
  { id: "pink", label: "Pink" },
  { id: "orange", label: "Orange" },
  { id: "teal", label: "Teal" },
];

function renderColorSheet() {
  const state = getFormState();
  const days = boardData(state, calculateProgress(state)).days;
  const current = localStorage.getItem(THEME_KEY) === "custom" ? (localStorage.getItem(CUSTOM_COLOR_KEY) || "").toLowerCase() : "";
  const wrap = document.querySelector("#colorSwatches");
  wrap.innerHTML = "";
  const dark = isDarkMode();
  receiptColorStatus(days).colors.forEach((color) => {
    // In dark mode the receipt is dark, so "black" ink is printed white: the swatch shows what you get.
    const neutralInDark = dark && color.id === "black";
    const name = neutralInDark ? t("White") : t(receiptColorNames.find((item) => item.id === color.id)?.label || "Color");
    const dotColor = neutralInDark ? "#f2f2f7" : color.hex;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `color-swatch${color.unlocked ? "" : " is-locked"}`;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(color.hex.toLowerCase() === current));
    button.setAttribute("aria-label", color.unlocked ? name : `${name}: ${t("From day {day}", { day: color.day })}`);
    button.innerHTML = `<span class="color-swatch__dot" style="background:${dotColor}"></span><span class="color-swatch__name"></span>`;
    button.querySelector(".color-swatch__name").textContent = color.unlocked ? name : t("From day {day}", { day: color.day });
    button.addEventListener("click", () => {
      if (!color.unlocked) {
        haptics.warning();
        showToast(t("Unlocks on day {day}", { day: color.day }));
        return;
      }
      customColorInput.value = color.hex;
      onColorChange();
      haptics.select();
      renderColorSheet();
    });
    wrap.append(button);
  });
}

function openColorSheet() {
  renderColorSheet();
  openSheet(document.querySelector("#colorSheet"));
}

document.querySelector("#customColorLabel").addEventListener("click", openColorSheet);
document.querySelector("#receiptColorButton").addEventListener("click", openColorSheet);
document.querySelector("#colorClose").addEventListener("click", () => closeSheet());

customColorInput.addEventListener("input", onColorChange);
customColorInput.addEventListener("change", onColorChange);
receiptColorInput.addEventListener("input", onColorChange);
receiptColorInput.addEventListener("change", onColorChange);


const storedCustomColor = (localStorage.getItem(CUSTOM_COLOR_KEY) || "#7c3aed").toLowerCase();
const savedCustomColor = OLD_RECEIPT_COLORS[storedCustomColor] || storedCustomColor;
if (savedCustomColor !== storedCustomColor) {
  localStorage.setItem(CUSTOM_COLOR_KEY, savedCustomColor);
  mirrorStorage(CUSTOM_COLOR_KEY);
}
customColorInput.value = savedCustomColor;
receiptColorInput.value = savedCustomColor;
applyCustomThemeVars(savedCustomColor);
applyTheme(localStorage.getItem(THEME_KEY) || "default");

// PWA (the iOS app ships its files in the bundle, so it needs no service worker)
if ("serviceWorker" in navigator && !isNativeApp) {
  navigator.serviceWorker.register("./sw.js");
}

let deferredInstallPrompt = null;

const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

// Receipt install button
const receiptInstallRow = document.getElementById("receiptInstallRow");

function showReceiptInstallRow() {
  if (isStandalone || isNativeApp) return;
  if (!isMobile && !deferredInstallPrompt) return;
  if (receiptInstallRow) receiptInstallRow.classList.remove("is-hidden");
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  if (!isStandalone && receiptInstallRow) receiptInstallRow.classList.remove("is-hidden");
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  if (receiptInstallRow) receiptInstallRow.classList.add("is-hidden");
});

// Language
const languageButton = document.querySelector("#languageButton");

function syncLanguageButton() {
  languageButton.textContent = languages[getLanguage()].label;
  const languageValue = document.querySelector("#languageValue");
  if (languageValue) languageValue.textContent = languages[getLanguage()].name;
}

function switchLanguage() {
  setLanguage(nextLanguage());
  refreshFormatters();
  syncLanguageButton();
  updateCurrencySymbols(currentCurrency);
  updateReceipt(false);
  showStep(currentStep);
  syncBenefitsVisibility();
  scheduleReminderSync(); // scheduled texts are stored in the language they were planned in
  haptics.select();
}

languageButton.addEventListener("click", switchLanguage);
applyTranslations();
syncLanguageButton();

const initialState = readState();
setFormState(initialState);
updateReceipt(false);

if (hasCompleteSavedState(initialState) && initialState.wizardDone !== false) {
  showStep(getActiveSteps().length - 1);
  // Returning users land on the on-board computer: days, money and life back at a glance.
  showReceipt(null, { animate: false, tab: "start" });
} else if (initialState.wizardDone === false && Number(initialState.wizardStep) > 0) {
  // Came back half-way: continue exactly where they left off.
  showStep(Number(initialState.wizardStep));
} else {
  showStep(0);
}



// ---------------------------------------------------------------------------
// App extensions: goal, reminders, craving SOS, printing and touch behaviour
// ---------------------------------------------------------------------------

function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  if (value === null) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(value));
  mirrorStorage(key);
}

function showToast(message, duration = 2200) {
  const toast = elements.toast;
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.remove("is-visible");
  void toast.offsetWidth;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => { toast.hidden = true; }, 250);
  }, duration);
}

function isReceiptVisible() {
  return elements.stage.classList.contains("is-receipt-only") && activeTab === "receipt";
}

// ----------------------------------------------------------------- printing
// The stepped "printer" animation felt janky on phones, so printing is now just a short haptic.
function printReceipt() {
  haptics.tap();
}

// ----------------------------------------------------------------- cravings
function readCravings() {
  return Number(localStorage.getItem(CRAVINGS_KEY)) || 0;
}

function addCraving() {
  localStorage.setItem(CRAVINGS_KEY, String(readCravings() + 1));
  mirrorStorage(CRAVINGS_KEY);
}

function cravingWorth(state) {
  const perDay = dailySaving(state);
  if (state.mode === "cigarettes" && state.cigarettesPerDay > 0) return perDay / state.cigarettesPerDay;
  if (state.mode === "ryo" && state.rollsPerDay > 0) return perDay / state.rollsPerDay;
  return null;
}

// ----------------------------------------------------------------- goal
function readGoal() {
  const goal = readJSON(GOAL_KEY, null);
  return goal?.name && Number(goal.price) > 0 ? goal : null;
}

function toInputDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function renderGoal(state) {
  const goal = readGoal();
  const progress = goal && !state.notStoppedYet ? goalProgress(state, goal) : null;
  elements.receiptGoal.classList.toggle("is-hidden", !progress);
  if (!progress) return;

  const wasReached = elements.receiptGoal.classList.contains("is-paid");
  elements.goalName.textContent = progress.name;
  elements.goalBar.textContent = asciiBar(progress.ratio, 18);
  elements.goalSaved.textContent = `${formatCurrency(progress.saved, state.currencyCode)} / ${formatCurrency(progress.price, state.currencyCode)}`;
  elements.goalPercent.textContent = `${Math.floor(progress.ratio * 100)}%`;
  elements.goalEta.textContent = progress.reached
    ? t("Goal reached. Go get it.")
    : progress.reachedAt
    ? t("Paid off {date}", { date: formatDate(toInputDate(progress.reachedAt)) })
    : "";
  elements.receiptGoal.classList.toggle("is-paid", progress.reached);
  if (progress.reached && !wasReached && isReceiptVisible()) haptics.success();
}

// ----------------------------------------------------------------- sheets
let openSheetEl = null;

function openSheet(sheet) {
  closeSheet(false);
  openSheetEl = sheet;
  elements.sheetBackdrop.hidden = false;
  sheet.hidden = false;
  sheet.style.transform = "";
  requestAnimationFrame(() => {
    elements.sheetBackdrop.classList.add("is-open");
    sheet.classList.add("is-open");
  });
  lockScroll();
}

function closeSheet(animate = true) {
  const sheet = openSheetEl;
  if (!sheet) return;
  openSheetEl = null;
  sheet.classList.remove("is-open");
  elements.sheetBackdrop.classList.remove("is-open");
  unlockScroll();
  document.activeElement?.blur?.();
  const hide = () => {
    if (openSheetEl === sheet) return;
    sheet.hidden = true;
    sheet.style.transform = "";
    if (!openSheetEl) elements.sheetBackdrop.hidden = true;
  };
  if (animate) window.setTimeout(hide, 260);
  else hide();
}

function enableSwipeToClose(sheet) {
  let startY = null;
  let delta = 0;
  sheet.addEventListener("touchstart", (event) => {
    // Only drag from the top area, so inputs and scrolling inside the sheet keep working.
    const rect = sheet.getBoundingClientRect();
    if (event.touches[0].clientY - rect.top > 90 || sheet.scrollTop > 0) return;
    startY = event.touches[0].clientY;
    delta = 0;
    sheet.style.transition = "none";
  }, { passive: true });
  sheet.addEventListener("touchmove", (event) => {
    if (startY === null) return;
    delta = Math.max(0, event.touches[0].clientY - startY);
    sheet.style.transform = `translateY(${delta}px)`;
  }, { passive: true });
  sheet.addEventListener("touchend", () => {
    if (startY === null) return;
    sheet.style.transition = "";
    startY = null;
    if (delta > 90) closeSheet();
    else sheet.style.transform = "";
  });
}

// ----------------------------------------------------------------- reminders
function readReminders() {
  return {
    enabled: false,
    asked: false,
    coach: true,
    milestones: true,
    money: true,
    checkin: true,
    weekly: false,
    daily: { enabled: false, hour: 9, minute: 0 },
    ...readJSON(REMINDERS_KEY, {}),
  };
}

function scheduleReminderSync() {
  if (!notificationsSupported) return;
  window.clearTimeout(reminderSyncTimer);
  reminderSyncTimer = window.setTimeout(syncReminders, 800);
}

async function syncReminders() {
  if (!notificationsSupported) return 0;
  const reminders = readReminders();
  if (!reminders.enabled) return 0;
  const state = readState();
  const plan = hasCompleteSavedState(state)
    ? buildNotificationPlan(state, notificationOptions(state, reminders))
    : [];
  return replaceScheduledNotifications(plan);
}

function planForNotifications() {
  return readPlan().items.map((item) => ({
    trigger: planLabel(planTriggers, item.trigger),
    action: planLabel(planActions, item.action),
  }));
}

function notificationOptions(state, reminders) {
  return {
    milestones: reminders.milestones,
    money: reminders.money,
    coach: reminders.coach,
    plan: planForNotifications(),
    daily: reminders.daily,
    checkin: { enabled: reminders.checkin, hour: 20, doneKeys: Object.keys(readCheckins()) },
    weekly: false,
    goal: readGoal(),
    healthMilestones: (state.mode === "vaping" ? vapingMilestones : tobaccoMilestones)
      .map((m) => ({ ...m, title: t(m.title), detail: t(m.detail) })),
    format: (value) => formatCurrency(value, state.currencyCode),
    t,
  };
}

const notificationsOffText = "Notifications are off for SMKFREE. Turn them on in your phone settings.";

async function openAlertsSheet() {
  const reminders = readReminders();
  elements.alertCoach.checked = reminders.coach;
  elements.alertMilestones.checked = reminders.milestones;
  elements.alertMoney.checked = reminders.money;
  elements.alertDaily.checked = reminders.daily.enabled;
  document.querySelector("#alertCheckin").checked = reminders.checkin;
  elements.alertTime.value = `${String(reminders.daily.hour).padStart(2, "0")}:${String(reminders.daily.minute).padStart(2, "0")}`;
  elements.alertTimeField.classList.toggle("is-hidden", !reminders.daily.enabled);

  if (!notificationsSupported) {
    elements.alertsStatus.textContent = t("Reminders work in the SMKFREE app. The web version cannot schedule them.");
    elements.alertsOptions.classList.add("is-hidden");
    elements.alertsSave.classList.add("is-hidden");
  } else {
    const permission = await notificationPermission();
    elements.alertsStatus.textContent = permission === "denied"
      ? t(notificationsOffText)
      : t("Notifications stay on this phone. Nothing is sent to a server.");
    elements.alertsSave.textContent = reminders.enabled ? t("Save") : t("Turn on");
  }
  openSheet(elements.alertsSheet);
}

async function saveAlerts() {
  const [hour, minute] = (elements.alertTime.value || "09:00").split(":").map(Number);
  const reminders = {
    ...readReminders(),
    asked: true,
    coach: elements.alertCoach.checked,
    milestones: elements.alertMilestones.checked,
    money: elements.alertMoney.checked,
    checkin: document.querySelector("#alertCheckin").checked,
    weekly: false,
    daily: { enabled: elements.alertDaily.checked, hour, minute },
  };

  const permission = await requestNotificationPermission();
  reminders.enabled = permission === "granted";
  writeJSON(REMINDERS_KEY, reminders);

  if (!reminders.enabled) {
    elements.alertsStatus.textContent = t(notificationsOffText);
    haptics.warning();
    return;
  }

  const count = await syncReminders();
  haptics.success();
  closeSheet();
  showToast(count ? t("{n} reminders printed", { n: count }) : t("Reminders on"));
}

function maybeOfferReminders() {
  if (!notificationsSupported) return;
  const reminders = readReminders();
  const state = readState();
  if (reminders.asked || reminders.enabled) return;
  if (!hasCompleteSavedState(state) || state.notStoppedYet) return;
  writeJSON(REMINDERS_KEY, { ...reminders, asked: true });
  window.setTimeout(() => { if (isReceiptVisible() && !openSheetEl) openAlertsSheet(); }, 2200);
}

// ----------------------------------------------------------------- craving SOS
const breathPattern = [
  { label: "Breathe in", seconds: 4, scale: 1 },
  { label: "Hold", seconds: 4, scale: 1 },
  { label: "Breathe out", seconds: 6, scale: 0.55 },
];

function formatClock(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

// SOS: one calm task. A circle grows and shrinks with the breath, the phase word and a 4-3-2-1 count
// say what to do, a thin line shows the 3 minutes. "Done" is there from the first second, "Stop" too.
// Everything is computed from the time since start on every frame (no CSS transitions), so the circle
// never gets stuck: not on the first breath after the page appears, not after locking the phone.
const BREATH_MIN = 0.55;
const BREATH_CYCLE = breathPattern.reduce((sum, phase) => sum + phase.seconds, 0);
let sosStartedAt = 0;
let sosPhaseIndex = -1;
let sosFrame = 0;
let sosWakeLock = null;

function enterSos() {
  renderSosPlan();
  stopSos();
  startSos();
}

/** Where in the breath we are: phase, seconds left in it and the circle size. Pure, from elapsed seconds. */
function breathAt(elapsed) {
  let t0 = elapsed % BREATH_CYCLE;
  let from = BREATH_MIN;
  for (let index = 0; index < breathPattern.length; index += 1) {
    const phase = breathPattern[index];
    if (t0 < phase.seconds) {
      const p = t0 / phase.seconds;
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * p);
      return { index, phase, left: phase.seconds - t0, scale: from + (phase.scale - from) * eased };
    }
    t0 -= phase.seconds;
    from = phase.scale;
  }
  return { index: 0, phase: breathPattern[0], left: breathPattern[0].seconds, scale: BREATH_MIN };
}

function resetSosUi() {
  elements.sosTimer.textContent = t("{time} left", { time: formatClock(SOS_SECONDS) });
  elements.breathPhase.textContent = t("Breathe in");
  elements.breathCount.textContent = "";
  elements.breathDisc.style.transition = "none";
  elements.breathDisc.style.transform = `scale(${BREATH_MIN})`;
  elements.sosFill.style.transition = "none";
  elements.sosFill.style.width = "0%";
  elements.sosDone.textContent = t("Done, the urge is gone");
}

function sosStep() {
  const elapsed = Math.max(0, (performance.now() - sosStartedAt) / 1000);
  const remaining = Math.max(0, SOS_SECONDS - elapsed);
  elements.sosTimer.textContent = t("{time} left", { time: formatClock(Math.ceil(remaining)) });
  elements.sosFill.style.width = `${Math.min(100, (elapsed / SOS_SECONDS) * 100)}%`;

  if (remaining <= 0) {
    stopSos();
    elements.breathDisc.style.transform = "scale(1)";
    elements.breathPhase.textContent = t("You made it");
    elements.breathCount.textContent = "";
    elements.sosDone.textContent = t("Save it");
    haptics.success();
    return;
  }

  const breath = breathAt(elapsed);
  elements.breathDisc.style.transform = `scale(${breath.scale.toFixed(4)})`;
  if (breath.index !== sosPhaseIndex) {
    sosPhaseIndex = breath.index;
    elements.breathPhase.textContent = t(breath.phase.label);
    // One soft pulse when a new breath starts, nothing in between.
    if (breath.index === 0) haptics.tap();
  }
  const count = String(Math.max(1, Math.ceil(breath.left)));
  if (elements.breathCount.textContent !== count) elements.breathCount.textContent = count;
  sosFrame = requestAnimationFrame(sosStep);
}

function startSos() {
  if (sosFrame) return;
  resetSosUi();
  sosStartedAt = performance.now();
  sosPhaseIndex = -1;
  sosStep();
  keepScreenOn();
}

// Keep the screen on for the three minutes where the browser allows it (the lock drops when the app is hidden).
function keepScreenOn() {
  navigator.wakeLock?.request?.("screen").then((lock) => { sosWakeLock = lock; }).catch(() => {});
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && sosFrame) keepScreenOn();
});

function stopSos() {
  cancelAnimationFrame(sosFrame);
  sosFrame = 0;
  sosWakeLock?.release?.().catch(() => {});
  sosWakeLock = null;
}

function finishSos() {
  addCraving();
  haptics.success();
  const entry = newDiaryEntry("craving");
  upsertDiaryEntry(entry);
  showTab("diary");
  openDiarySheet(entry, { isNew: false, fromSos: true });
  showToast(t("Craving #{n} resisted", { n: readCravings() }));
}

// ----------------------------------------------------------------- if-then plan
// Implementation intentions: link a moment you would smoke to what you do instead.
// Each trigger suggests a fitting action, which the user can change.
const planTriggers = [
  { id: "coffee", label: "Coffee", action: "water" },
  { id: "meal", label: "After a meal", action: "walk" },
  { id: "alcohol", label: "Drinking alcohol", action: "hands" },
  { id: "stress", label: "Stress", action: "breathe" },
  { id: "break", label: "Breaks", action: "walk" },
  { id: "smokers", label: "Others smoke", action: "leave" },
  { id: "bored", label: "Boredom", action: "text" },
  { id: "driving", label: "Driving", action: "gum" },
];

const planActions = [
  { id: "walk", label: "Walk for 5 minutes" },
  { id: "squats", label: "Do 10 squats" },
  { id: "breathe", label: "Breathe with SOS" },
  { id: "water", label: "Drink a glass of water" },
  { id: "gum", label: "Chew gum" },
  { id: "text", label: "Text a friend" },
  { id: "leave", label: "Step away" },
  { id: "hands", label: "Keep my hands busy" },
];

const planTriggerIds = planTriggers.map((item) => item.id);
const planActionIds = planActions.map((item) => item.id);
let planDraft = [];

function planLabel(list, id) {
  const entry = list.find((item) => item.id === id);
  return entry ? t(entry.label) : "";
}

function readPlan() {
  return normalizePlan(readJSON(PLAN_KEY, null), planTriggerIds, planActionIds);
}

function syncPlanValue() {
  const count = readPlan().items.length;
  elements.planValue.textContent = count ? `${count}/${PLAN_MAX_ITEMS}` : "--";
}

function enterPlan() {
  planDraft = readPlan().items.map((item) => ({ ...item }));
  elements.planRemove.classList.toggle("is-hidden", planDraft.length === 0);
  renderPlanEditor();
}

function togglePlanTrigger(trigger) {
  const index = planDraft.findIndex((item) => item.trigger === trigger.id);
  if (index >= 0) {
    planDraft.splice(index, 1);
  } else if (planDraft.length >= PLAN_MAX_ITEMS) {
    haptics.warning();
    showToast(t("Up to {n} moments. Remove one first.", { n: PLAN_MAX_ITEMS }));
    return;
  } else {
    planDraft.push({ trigger: trigger.id, action: trigger.action });
  }
  haptics.select();
  renderPlanEditor();
}

function renderPlanEditor() {
  elements.planTriggers.innerHTML = "";
  planTriggers.forEach((trigger) => {
    const active = planDraft.some((item) => item.trigger === trigger.id);
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = t(trigger.label);
    chip.classList.toggle("is-active", active);
    chip.setAttribute("aria-pressed", String(active));
    chip.addEventListener("click", () => togglePlanTrigger(trigger));
    elements.planTriggers.append(chip);
  });

  elements.planRows.innerHTML = "";
  planDraft.forEach((item) => {
    const row = document.createElement("li");
    const label = document.createElement("label");
    const trigger = document.createElement("span");
    trigger.className = "plan-list__if";
    trigger.textContent = `${planLabel(planTriggers, item.trigger)} →`;
    const select = document.createElement("select");
    select.setAttribute("aria-label", t("What you do instead"));
    planActions.forEach((action) => {
      select.append(new Option(t(action.label), action.id, false, action.id === item.action));
    });
    select.addEventListener("input", () => {
      item.action = select.value;
      haptics.select();
    });
    label.append(trigger, select);
    row.append(label);
    elements.planRows.append(row);
  });
}

function savePlan() {
  writeJSON(PLAN_KEY, planDraft.length ? { items: planDraft } : null);
  syncPlanValue();
  scheduleReminderSync();
  elements.planRemove.classList.toggle("is-hidden", planDraft.length === 0);
  haptics.success();
  const button = document.querySelector("#planSave");
  setButtonLabel(button, planDraft.length ? t("✓ Saved") : t("Plan removed"));
  button.disabled = true;
  showToast(planDraft.length ? t("Plan saved. It shows up in SOS.") : t("Plan removed"));
  // Short confirmation on the button, then back to where the plan was opened from.
  window.setTimeout(() => {
    button.disabled = false;
    setButtonLabel(button, t("Save plan"));
    if (activeTab === "plan") showTab(planReturnTab === "plan" ? "start" : planReturnTab);
  }, 900);
}

function renderSosPlan() {
  const items = readPlan().items;
  elements.sosPlanList.innerHTML = "";
  items.forEach((item) => {
    const row = document.createElement("li");
    const trigger = document.createElement("span");
    trigger.className = "plan-list__if";
    trigger.textContent = `${planLabel(planTriggers, item.trigger)} →`;
    const action = document.createElement("strong");
    action.textContent = planLabel(planActions, item.action);
    row.append(trigger, action);
    elements.sosPlanList.append(row);
  });
  elements.sosPlanBox.classList.toggle("is-hidden", items.length === 0);
}

// ----------------------------------------------------------------- developer mode
// Hidden until the version row is tapped 7 times. Not user data, so a reset keeps it.
const DEV_KEY = "smkfree-dev";
const DEV_TAPS = 7;
const DEV_TEST_ID = 9000;
let versionTaps = 0;
let versionTapTimer = null;
let devCoachIndex = 0;

function isDevMode() {
  return localStorage.getItem(DEV_KEY) === "1";
}

function syncDevMode() {
  elements.devButton.classList.toggle("is-hidden", !isDevMode());
}

async function showVersion() {
  const info = await appInfo();
  elements.versionValue.textContent = info.build ? `${info.version} (${info.build})` : info.version;
}

function tapVersion() {
  if (isDevMode()) {
    showToast(t("Developer mode is already on"));
    return;
  }
  versionTaps += 1;
  window.clearTimeout(versionTapTimer);
  versionTapTimer = window.setTimeout(() => { versionTaps = 0; }, 1500);
  const left = DEV_TAPS - versionTaps;
  if (left <= 0) {
    versionTaps = 0;
    localStorage.setItem(DEV_KEY, "1");
    syncDevMode();
    haptics.success();
    showToast(t("Developer mode on"));
  } else if (left <= 3) {
    haptics.tap();
    showToast(t("Developer mode in {n}", { n: left }));
  }
}

/** Builds one test notification, due in 10 seconds. Coach tips cycle through the first two weeks. */
function devTestNotification(kind) {
  const at = new Date(Date.now() + 10_000);
  if (kind === "coach") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const tips = buildCoachPlan(start, planForNotifications(), t, new Date(start.getTime() - 1));
    const tip = tips[devCoachIndex % tips.length];
    devCoachIndex += 1;
    elements.devCoachValue.textContent = String((devCoachIndex % tips.length) + 1);
    return { id: DEV_TEST_ID, at, title: tip.title, body: tip.body };
  }
  const state = readState();
  if (!hasCompleteSavedState(state)) return null;
  const options = {
    ...notificationOptions(state, readReminders()),
    milestones: true,
    money: true,
    coach: false,
    daily: { enabled: true, hour: 9, minute: 0 },
  };
  const ranges = { milestone: [1000, 3000], money: [3000, 4000], daily: [5000, 6000] };
  const [low, high] = ranges[kind];
  const next = buildNotificationPlan(state, options).find((item) => item.id >= low && item.id < high);
  return next ? { id: DEV_TEST_ID, at, title: next.title, body: next.body } : null;
}

async function sendDevTest(kind) {
  const item = devTestNotification(kind);
  if (!item) {
    haptics.warning();
    showToast(t("Needs a quit date in the past"));
    return;
  }
  elements.devStatus.textContent = `${item.title}: ${item.body}`;
  if (!notificationsSupported) {
    showToast(t("Web: preview only"));
    return;
  }
  if (!(await scheduleTestNotification(item))) {
    haptics.warning();
    showToast(t(notificationsOffText));
    return;
  }
  haptics.success();
  showToast(t("Arrives in 10 seconds"));
}

function openDevSheet() {
  elements.devStatus.textContent = t("Each test arrives in 10 seconds. Lock the phone or switch apps to see it.");
  openSheet(elements.devSheet);
}

function initDevMode() {
  document.querySelector("#versionRow").addEventListener("click", tapVersion);
  elements.devButton.addEventListener("click", openDevSheet);
  document.querySelector("#devClose").addEventListener("click", () => closeSheet());
  document.querySelector("#devOff").addEventListener("click", () => {
    localStorage.removeItem(DEV_KEY);
    saveDevType({ font: "", size: 100 });
    syncDevMode();
    closeSheet();
    showToast(t("Developer mode off"));
  });
  document.querySelectorAll("[data-dev-test]").forEach((button) => {
    button.addEventListener("click", () => sendDevTest(button.dataset.devTest));
  });
  [elements.resetSheet, elements.devSheet].forEach(enableSwipeToClose);
  initDevTypography();
  syncDevMode();
  showVersion();
}

// Developer: try other fonts and text sizes on a real phone. Size uses zoom because most sizes are in px.
const DEV_TYPE_KEY = "smkfree-dev-type";
const devFonts = {
  system: "system-ui, -apple-system, \"Segoe UI\", Roboto, Arial, sans-serif",
  rounded: "ui-rounded, \"SF Pro Rounded\", \"Nunito\", \"Varela Round\", system-ui, sans-serif",
  serif: "ui-serif, Georgia, \"Times New Roman\", serif",
  courier: "\"Courier New\", Courier, monospace",
};

function readDevType() {
  const raw = readJSON(DEV_TYPE_KEY, null) || {};
  const size = Math.min(140, Math.max(80, Number(raw.size) || 100));
  return { font: devFonts[raw.font] ? raw.font : "", size };
}

function applyDevType({ font, size }) {
  const root = document.documentElement;
  if (font) {
    root.dataset.devFont = font;
    root.style.setProperty("--dev-font", devFonts[font]);
  } else {
    delete root.dataset.devFont;
    root.style.removeProperty("--dev-font");
  }
  document.body.style.zoom = size === 100 ? "" : String(size / 100);
  const fontSelect = document.querySelector("#devFont");
  const sizeInput = document.querySelector("#devSize");
  fontSelect.value = font;
  sizeInput.value = String(size);
  document.querySelector("#devSizeValue").textContent = `${size} %`;
}

function saveDevType(value) {
  if (!value.font && value.size === 100) localStorage.removeItem(DEV_TYPE_KEY);
  else localStorage.setItem(DEV_TYPE_KEY, JSON.stringify(value));
  mirrorStorage(DEV_TYPE_KEY);
  applyDevType(value);
}

function initDevTypography() {
  const fontSelect = document.querySelector("#devFont");
  const sizeInput = document.querySelector("#devSize");
  fontSelect.addEventListener("change", () => saveDevType({ ...readDevType(), font: fontSelect.value }));
  sizeInput.addEventListener("input", () => saveDevType({ ...readDevType(), size: Number(sizeInput.value) }));
  document.querySelector("#devTypeReset").addEventListener("click", () => {
    saveDevType({ font: "", size: 100 });
    showToast(t("Font and size reset"));
  });
  applyDevType(readDevType());
}

// ----------------------------------------------------------------- diary
// Cravings and slips with strength, trigger and a note. A slip is logged, never a reset.
const diaryTriggers = [...planTriggers, { id: "other", label: "Other" }];
const diaryTriggerIds = diaryTriggers.map((item) => item.id);
const dayPartLabels = {
  morning: "Most entries: mornings",
  afternoon: "Most entries: afternoons",
  evening: "Most entries: evenings",
  night: "Most entries: nights",
};
let diaryDraft = null;

function readDiary() {
  return normalizeDiary(readJSON(DIARY_KEY, null), diaryTriggerIds);
}

function writeDiary(entries) {
  writeJSON(DIARY_KEY, entries.length ? { entries } : null);
}

function upsertDiaryEntry(entry) {
  const entries = readDiary().entries.filter((item) => item.id !== entry.id);
  writeDiary([entry, ...entries]);
}

function newDiaryEntry(kind) {
  const at = Date.now();
  return { id: `${at}-${Math.random().toString(36).slice(2, 7)}`, at, kind, strength: null, trigger: null, note: "" };
}

/** Opens the entry sheet. fromSos: the craving is already counted and saved, only details are added. */
function openDiarySheet(entry, { isNew = true, fromSos = false, fixedKind = false } = {}) {
  diaryDraft = { ...entry, isNew, fromSos, fixedKind };
  renderDiarySheet();
  openSheet(elements.diarySheet);
}

// Two dropdowns: what happened, and what triggered it. Strength and note stay on old entries but are no longer asked.
function renderDiarySheet() {
  const draft = diaryDraft;
  // Coming from "+" or SOS, the user already said what happened: only ask for the trigger.
  const kindKnown = draft.fromSos || draft.fixedKind;
  elements.diarySheetTitle.textContent = kindKnown
    ? draft.kind === "slip" ? t("You smoked. What set it off?") : t("Well done. What set it off?")
    : draft.isNew ? t("New entry") : t("Edit entry");
  document.querySelector("#diaryKindField").classList.toggle("is-hidden", kindKnown || !draft.isNew);
  const kind = document.querySelector("#diaryKindSelect");
  kind.value = draft.kind;
  const trigger = document.querySelector("#diaryTriggerSelect");
  trigger.innerHTML = "";
  [{ id: "", label: "Not sure" }, ...diaryTriggers].forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = t(item.label);
    trigger.append(option);
  });
  trigger.value = draft.trigger || "";
  document.querySelector("#diaryNote").value = draft.note || "";
  // Opening an existing entry shows when it happened.
  const when = document.querySelector("#diaryWhen");
  when.classList.toggle("is-hidden", draft.isNew && !draft.fromSos);
  when.textContent = new Intl.DateTimeFormat(intlLocale(), {
    weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(draft.at));
  elements.diarySlipHint.classList.toggle("is-hidden", draft.kind !== "slip");
}

function saveDiaryEntry() {
  diaryDraft.note = document.querySelector("#diaryNote").value.trim().slice(0, DIARY_NOTE_MAX);
  const { isNew, fromSos, fixedKind, ...entry } = diaryDraft;
  upsertDiaryEntry(entry);
  if (isNew && !fromSos && entry.kind === "craving") addCraving();
  diaryDraft = null;
  closeSheet();
  haptics.success();
  renderDiary();
  updateReceipt(false);
  showToast(entry.kind === "slip" ? t("Logged. Keep going.") : t("Saved to your diary"));
}

function deleteDiaryEntry(id) {
  const entries = readDiary().entries;
  const entry = entries.find((item) => item.id === id);
  if (!entry) return;
  writeDiary(entries.filter((item) => item.id !== id));
  if (entry.kind === "craving") {
    localStorage.setItem(CRAVINGS_KEY, String(Math.max(0, readCravings() - 1)));
    mirrorStorage(CRAVINGS_KEY);
  }
  haptics.select();
  renderDiary();
  showToast(t("Entry deleted"));
}

function diaryDayLabel(date) {
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return t("Today");
  if (date.toDateString() === yesterday.toDateString()) return t("Yesterday");
  return new Intl.DateTimeFormat(intlLocale(), { weekday: "short", day: "numeric", month: "short" }).format(date);
}

function renderDiary() {
  const entries = readDiary().entries;
  const stats = diaryStats(entries);
  document.querySelector("#diarySummary").textContent = t("Last 7 days: {c} resisted · {s} slips", {
    c: numberFormatter.format(stats.weekCravings),
    s: numberFormatter.format(stats.weekSlips),
  });
  // One line instead of a chart: the trigger that shows up most.
  const top = stats.topTriggers[0];
  const topLine = document.querySelector("#diaryTop");
  topLine.classList.toggle("is-hidden", !top);
  if (top) topLine.textContent = t("Most common trigger: {trigger}", { trigger: planLabel(diaryTriggers, top.trigger) });

  // Entries, newest first, grouped by day.
  const time = new Intl.DateTimeFormat(intlLocale(), { hour: "2-digit", minute: "2-digit" });
  elements.diaryList.innerHTML = "";
  let lastDay = "";
  entries.slice(0, 60).forEach((entry) => {
    const date = new Date(entry.at);
    const day = diaryDayLabel(date);
    if (day !== lastDay) {
      const heading = document.createElement("li");
      heading.className = "diary-day";
      heading.textContent = day;
      elements.diaryList.append(heading);
      lastDay = day;
    }
    const row = document.createElement("li");
    row.className = `diary-entry diary-entry--${entry.kind}`;
    const main = document.createElement("button");
    main.type = "button";
    main.className = "diary-entry__main";
    const parts = [entry.kind === "slip" ? t("Slipped") : t("Resisted")];
    if (entry.trigger) parts.push(planLabel(diaryTriggers, entry.trigger));
    main.innerHTML = "<span class=\"diary-entry__time\"></span><span class=\"diary-entry__text\"></span>";
    main.querySelector(".diary-entry__time").textContent = time.format(date);
    main.querySelector(".diary-entry__text").textContent = parts.join(" · ") + (entry.note ? ` – ${entry.note}` : "");
    main.addEventListener("click", () => openDiarySheet(entry, { isNew: false }));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "diary-entry__delete";
    remove.textContent = "×";
    remove.setAttribute("aria-label", t("Delete entry"));
    remove.addEventListener("click", () => deleteDiaryEntry(entry.id));
    row.append(main, remove);
    elements.diaryList.append(row);
  });
  elements.diaryEmpty.classList.toggle("is-hidden", entries.length > 0);
}

function initDiary() {
  document.querySelector("#diaryAdd").addEventListener("click", () => openDiarySheet(newDiaryEntry("craving")));
  document.querySelector("#diaryKindSelect").addEventListener("change", (event) => {
    diaryDraft.kind = event.target.value;
    renderDiarySheet();
  });
  document.querySelector("#diaryTriggerSelect").addEventListener("change", (event) => {
    diaryDraft.trigger = event.target.value || null;
  });
  document.querySelector("#diarySave").addEventListener("click", saveDiaryEntry);
  document.querySelector("#diaryCancel").addEventListener("click", () => {
    diaryDraft = null;
    closeSheet();
  });
  enableSwipeToClose(elements.diarySheet);
}

// ----------------------------------------------------------------- touch
function addSteppers() {
  document.querySelectorAll(".step input[type='number']").forEach((input) => {
    if (input.closest(".stepper")) return;
    const wrap = document.createElement("div");
    wrap.className = "stepper";
    const minus = document.createElement("button");
    const plus = document.createElement("button");
    minus.type = "button";
    plus.type = "button";
    minus.className = "stepper__button";
    plus.className = "stepper__button";
    minus.textContent = "-";
    plus.textContent = "+";
    minus.setAttribute("aria-label", t("Decrease"));
    plus.setAttribute("aria-label", t("Increase"));
    input.inputMode = "numeric";
    input.parentNode.insertBefore(wrap, input);
    wrap.append(minus, input, plus);

    const step = (delta) => {
      const min = Number(input.min) || 0;
      const fallback = Number(input.placeholder) || min;
      const current = input.value === "" ? fallback - delta : Number(input.value);
      input.value = String(Math.max(min, current + delta));
      input.dispatchEvent(new Event("input", { bubbles: true }));
      haptics.select();
    };

    // Press and hold repeats, like a real stepper.
    [[minus, -1], [plus, 1]].forEach(([button, delta]) => {
      let delay = null;
      let repeat = null;
      const stop = () => {
        window.clearTimeout(delay);
        window.clearInterval(repeat);
        delay = null;
        repeat = null;
      };
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        step(delta);
        delay = window.setTimeout(() => { repeat = window.setInterval(() => step(delta), 90); }, 420);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach((type) => button.addEventListener(type, stop));
      button.addEventListener("click", (event) => event.preventDefault());
    });
  });
}

function enableWizardSwipe() {
  let start = null;
  elements.form.addEventListener("touchstart", (event) => {
    if (event.target.closest("input, select, .stepper")) { start = null; return; }
    start = { x: event.touches[0].clientX, y: event.touches[0].clientY, t: Date.now() };
  }, { passive: true });
  elements.form.addEventListener("touchend", (event) => {
    if (!start) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    const fast = Date.now() - start.t < 600;
    start = null;
    if (!fast || Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) advanceWizard();
    else if (currentStep > 0) showStep(currentStep - 1);
  }, { passive: true });
}

function initTouchEnhancements() {
  addSteppers();
  addMoneySteppers();
  enableWizardSwipe();


  document.querySelectorAll(".step input").forEach((input) => {
    if (!input.enterKeyHint) input.enterKeyHint = "next";
  });
}

// ----------------------------------------------------------------- wiring
function initTools() {
  const goalSave = document.querySelector("#goalSave");
  const goalRemove = document.querySelector("#goalRemove");

  document.querySelector("#goalButton").addEventListener("click", () => {
    const goal = readGoal();
    elements.goalNameInput.value = goal?.name || "";
    elements.goalPriceInput.value = goal?.price || "";
    elements.goalError.classList.add("is-hidden");
    goalRemove.classList.toggle("is-hidden", !goal);
    openSheet(elements.goalSheet);
  });

  goalSave.addEventListener("click", () => {
    const name = elements.goalNameInput.value.trim();
    const price = parseDecimal(elements.goalPriceInput.value);
    if (!name || !price || price <= 0) {
      elements.goalError.classList.remove("is-hidden");
      haptics.warning();
      return;
    }
    writeJSON(GOAL_KEY, { name, price });
    closeSheet();
    updateReceipt(false);
    scheduleReminderSync();
    haptics.success();
    showToast(t("Goal added to your receipt"));
  });

  goalRemove.addEventListener("click", () => {
    writeJSON(GOAL_KEY, null);
    closeSheet();
    updateReceipt(false);
    scheduleReminderSync();
  });

  elements.goalNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); elements.goalPriceInput.focus(); }
  });
  elements.goalPriceInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); goalSave.click(); }
  });

  document.querySelector("#alertsButton").addEventListener("click", openAlertsSheet);
  document.querySelector("#alertsClose").addEventListener("click", () => closeSheet());
  elements.alertsSave.addEventListener("click", saveAlerts);
  elements.alertDaily.addEventListener("input", () => {
    elements.alertTimeField.classList.toggle("is-hidden", !elements.alertDaily.checked);
  });

  elements.sosDone.addEventListener("click", finishSos);
  elements.sosStop.addEventListener("click", () => goBack());

  document.querySelector("#planButton").addEventListener("click", () => showTab("plan"));
  document.querySelector("#planSave").addEventListener("click", savePlan);
  elements.planRemove.addEventListener("click", () => {
    planDraft = [];
    savePlan();
  });

  elements.sheetBackdrop.addEventListener("click", () => closeSheet());
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeSheet(); });
  [elements.goalSheet, elements.alertsSheet].forEach(enableSwipeToClose);

  onAppResume(() => {
    if (isReceiptVisible()) updateReceipt(false);
    syncReminders();
  });

  if (isReceiptVisible()) maybeOfferReminders();
  elements.receiptButton.addEventListener("click", maybeOfferReminders);
  syncReminders();
}


// ---------------------------------------------------------------------------
// Onboarding helpers: quick date picks and auto-advance
// ---------------------------------------------------------------------------


function dateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toInputDate(date);
}

function syncDateChips() {
  document.querySelectorAll(".chip[data-days-ago]").forEach((chip) => {
    chip.classList.toggle("is-active",
      !elements.notStoppedYet.checked && elements.quitDate.value === dateDaysAgo(Number(chip.dataset.daysAgo)));
  });
}

function initOnboarding() {
  document.querySelectorAll(".chip[data-days-ago]").forEach((chip) => {
    chip.addEventListener("click", () => {
      elements.notStoppedYet.checked = false;
      syncNotStoppedFields();
      elements.quitDate.value = dateDaysAgo(Number(chip.dataset.daysAgo));
      setQuitDateError("");
      syncAdvancedFields();
      syncDateChips();
      updateReceipt();
      haptics.select();
      window.setTimeout(advanceWizard, 240);
    });
  });
  elements.quitDate.addEventListener("input", syncDateChips);
  elements.notStoppedYet.addEventListener("input", syncDateChips);

  // Tapping a field with a value selects it, so typing replaces the number instead of adding to it.
  document.querySelectorAll("#quitForm input[type='number'], #quitForm input[inputmode='decimal']").forEach((input) => {
    let justFocused = false;
    const selectAll = () => { try { input.select(); } catch { /* not selectable */ } };
    input.addEventListener("focus", () => {
      if (!input.value) return;
      justFocused = true;
      // iOS places the caret after focus, so select a moment later.
      window.setTimeout(selectAll, 0);
    });
    // Releasing the finger or mouse puts the caret back, so select once more on that first click.
    input.addEventListener("click", () => {
      if (!justFocused) return;
      justFocused = false;
      selectAll();
    });
    input.addEventListener("blur", () => { justFocused = false; });
  });

  syncDateChips();
}

// ----------------------------------------------------------------- money steppers
const moneyStepSizes = {
  pricePerPack: 0.1,
  costPer10ml: 0.1,
  weeklyRyoCost: 1,
  accessoriesPerMonth: 1,
  goalPriceInput: 10,
};

function formatMoneyInput(value) {
  const fixed = (Math.round(value * 100) / 100).toFixed(2);
  return getLanguage() === "de" ? fixed.replace(".", ",") : fixed;
}

function addMoneySteppers() {
  Object.entries(moneyStepSizes).forEach(([id, size]) => {
    const input = document.getElementById(id);
    const field = input?.closest(".money-field");
    if (!field || field.closest(".stepper")) return;

    const wrap = document.createElement("div");
    wrap.className = "stepper stepper--money";
    const minus = document.createElement("button");
    const plus = document.createElement("button");
    for (const [button, text, label] of [[minus, "-", "Decrease"], [plus, "+", "Increase"]]) {
      button.type = "button";
      button.className = "stepper__button";
      button.textContent = text;
      button.setAttribute("aria-label", t(label));
    }
    field.parentNode.insertBefore(wrap, field);
    wrap.append(minus, field, plus);

    const step = (direction) => {
      const current = parseDecimal(input.value);
      const fallback = parseDecimal(input.placeholder) ?? 0;
      const base = current === null ? fallback - direction * size : current;
      // Snap to the step grid so 9.47 + 0.10 becomes 9.50, not 9.57.
      const next = Math.max(0, Math.round((base + direction * size) / size) * size);
      input.value = formatMoneyInput(next);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      haptics.select();
    };
    bindRepeatingPress(minus, () => step(-1));
    bindRepeatingPress(plus, () => step(1));
  });
}

function bindRepeatingPress(button, action) {
  let delay = null;
  let repeat = null;
  const stop = () => {
    window.clearTimeout(delay);
    window.clearInterval(repeat);
    delay = null;
    repeat = null;
  };
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    action();
    delay = window.setTimeout(() => { repeat = window.setInterval(action, 80); }, 420);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach((type) => button.addEventListener(type, stop));
  button.addEventListener("click", (event) => event.preventDefault());
}

// ----------------------------------------------------------------- tab bar
// Receipt, plan, SOS, diary and more are pages in the receipt view; small tasks stay in sheets.
function setActiveTab(name) {
  activeTab = name;
  elements.receiptWrap.dataset.tab = name;
  document.querySelectorAll(".tab-page").forEach((page) => { page.hidden = page.dataset.tab !== name; });
  document.querySelectorAll(".tab-button").forEach((button) => {
    const active = button.dataset.tab === name;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}

let planReturnTab = "start";

// Pages you go into (not tabs) and where "back" leads from them.
const SUB_PAGES = new Set(["health", "plan", "sos"]);
let subReturnTab = "start";

function showTab(name, { fromHistory = false } = {}) {
  if (name === "plan" && activeTab !== "plan") planReturnTab = activeTab || "start";
  if (SUB_PAGES.has(name) && !SUB_PAGES.has(activeTab)) subReturnTab = activeTab || "start";
  // A history entry per sub page, so Safari's own swipe from the left edge goes back.
  if (SUB_PAGES.has(name) && name !== activeTab && !fromHistory) history.pushState({ smkfreePage: name }, "");
  // Leaving a sub page another way (tab bar, a link): drop its history entry again.
  if (SUB_PAGES.has(activeTab) && !SUB_PAGES.has(name) && !fromHistory && history.state?.smkfreePage) history.back();
  if (activeTab === "sos" && name !== "sos") stopSos();
  closeSheet(false);
  setActiveTab(name);
  window.scrollTo({ top: 0 });
  if (name === "receipt") updateReceipt(false);
  if (name === "sos") enterSos();
  if (name === "plan") enterPlan();
  if (name === "diary") renderDiary();
  if (name === "health") renderHealth();
}

// ----------------------------------------------------------------- back (swipe from the left edge)
function canGoBack() {
  return Boolean(openSheetEl) || SUB_PAGES.has(activeTab);
}

/** One step back: close the open sheet, or leave the sub page. */
function goBack({ fromHistory = false } = {}) {
  if (openSheetEl) {
    closeSheet();
    return true;
  }
  if (SUB_PAGES.has(activeTab)) {
    const target = activeTab === "plan" ? planReturnTab : subReturnTab;
    showTab(SUB_PAGES.has(target) ? "start" : target, { fromHistory: true });
    if (!fromHistory && history.state?.smkfreePage) history.back();
    return true;
  }
  return false;
}

function initBackNavigation() {
  // Safari in the browser: its edge swipe goes back in history.
  window.addEventListener("popstate", () => {
    if (canGoBack()) goBack({ fromHistory: true });
  });
  // The app and the home-screen version have no browser swipe: follow the finger from the left edge.
  if (!isNativeApp && !isStandalone) return;
  let start = null;
  let page = null;
  document.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    start = touch.clientX < 24 && canGoBack() ? { x: touch.clientX, y: touch.clientY, dx: 0 } : null;
    page = start ? (openSheetEl || document.querySelector(`.tab-page[data-tab="${activeTab}"]`)) : null;
  }, { passive: true });
  document.addEventListener("touchmove", (event) => {
    if (!start) return;
    const touch = event.touches[0];
    const dx = touch.clientX - start.x;
    const dy = Math.abs(touch.clientY - start.y);
    if (dy > 40 && dy > dx) { start = null; page?.style.removeProperty("transform"); return; }
    start.dx = Math.max(0, dx);
    if (page && !openSheetEl) {
      page.style.transition = "none";
      page.style.transform = `translateX(${start.dx * 0.6}px)`;
    }
  }, { passive: true });
  document.addEventListener("touchend", () => {
    if (!start) return;
    const done = start.dx > 80;
    if (page && !openSheetEl) {
      page.style.transition = "transform 200ms ease";
      page.style.transform = "";
      window.setTimeout(() => page && page.style.removeProperty("transition"), 220);
    }
    start = null;
    if (done) {
      haptics.select();
      goBack();
    }
  });
}

function initTabs() {
  document.querySelectorAll(".tab-button[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.tab === activeTab && activeTab !== "sos") return;
      haptics.select();
      showTab(button.dataset.tab);
    });
  });
}

// ----------------------------------------------------------------- first-run hints
function syncReceiptHint() {
  document.querySelector("#receiptHint").classList.toggle("is-hidden", localStorage.getItem(HINT_KEY) === "1");
}

function initHints() {
  const infoButton = document.querySelector("#introInfoButton");
  infoButton.addEventListener("click", () => {
    const open = infoButton.getAttribute("aria-expanded") !== "true";
    infoButton.setAttribute("aria-expanded", String(open));
    document.querySelector("#introPoints").classList.toggle("is-hidden", !open);
    haptics.select();
  });
  document.querySelector("#receiptHintClose").addEventListener("click", () => {
    localStorage.setItem(HINT_KEY, "1");
    mirrorStorage(HINT_KEY);
    syncReceiptHint();
    haptics.select();
  });
  syncReceiptHint();
}

// ----------------------------------------------------------------- More page
function initMoreMenu() {
  document.querySelector("#languageMenuButton").addEventListener("click", switchLanguage);
  // Leaving the receipt (edit) should not leave the menu open behind the wizard.
  elements.editButton.addEventListener("click", () => {
    closeSheet(false);
    window.scrollTo({ top: 0 });
  });
  syncBenefitsVisibility();
  syncLanguageButton();
  syncPlanValue();
}

// ----------------------------------------------------------------- collapsed defaults (pack size, currency)
function renderExtrasToggles(state = getFormState()) {
  document.querySelectorAll(".extras-toggle").forEach((toggle) => {
    const step = toggle.closest(".step");
    const open = toggle.getAttribute("aria-expanded") === "true";
    const text = step.dataset.mode === "cigarettes"
      ? t("{n} per pack · {currency} · change", { n: state.cigarettesPerPack || 20, currency: state.currencyCode })
      : t("Currency: {currency} · change", { currency: state.currencyCode });
    toggle.textContent = `${open ? "−" : "+"} ${text}`;
  });
}

function initExtras() {
  document.querySelectorAll(".extras-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const extras = toggle.nextElementSibling;
      const open = extras.classList.toggle("is-hidden") === false;
      toggle.setAttribute("aria-expanded", String(open));
      renderExtrasToggles();
      haptics.select();
    });
  });
  renderExtrasToggles();
}

// ----------------------------------------------------------------- scroll lock (iOS-safe)
let lockedScrollY = 0;

function lockScroll() {
  if (document.body.classList.contains("has-sheet")) return;
  lockedScrollY = window.scrollY;
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.classList.add("has-sheet");
}

function unlockScroll() {
  if (!document.body.classList.contains("has-sheet")) return;
  document.body.classList.remove("has-sheet");
  document.body.style.top = "";
  window.scrollTo(0, lockedScrollY);
}

// ----------------------------------------------------------------- sharing hooks
function shareText() {
  const state = getFormState();
  const cur = state.currencyCode;
  if (state.notStoppedYet) {
    return t("Smoking costs me {amount} a year. What does it cost you? Find out in 30 seconds:",
      { amount: formatCurrency(dailySaving(state) * 365, cur) });
  }
  const progress = calculateProgress(state);
  return t("{days} days smoke-free and {amount} not burned. What would you save? Find out in 30 seconds:",
    { days: numberFormatter.format(progress.wholeDays), amount: formatCurrency(progress.moneySaved, cur) });
}

/** Highest day milestone reached that has not been offered for sharing yet. */
function pendingShareMilestone(state, progress) {
  if (state.notStoppedYet || !state.quitDate) return null;
  const reached = dayThresholds.filter((days) => progress.wholeDays >= days).pop();
  if (!reached) return null;
  return Number(localStorage.getItem(SHARE_PROMPT_KEY)) >= reached ? null : reached;
}

// ----------------------------------------------------------------- interactive receipt
function renderInteractive(state, progress) {
  const perDay = dailySaving(state);
  const cur = state.currencyCode;

  // Projection under the total.
  document.querySelector("#breakdownTitle").textContent = state.notStoppedYet ? t("Costs you") : t("You save");
  document.querySelector("#breakdownRows").innerHTML = [
    [t("Per day"), perDay],
    [t("Per week"), perDay * 7],
    [t("Per month"), perDay * 30.4375],
    [t("Per year"), perDay * 365],
  ].map(([label, value]) => `<div><dt>${label}</dt><dd>${formatCurrency(value, cur)}</dd></div>`).join("");
  document.querySelector("#totalToggle").classList.toggle("is-interactive", perDay > 0);

  // Coupons.
  const milestone = pendingShareMilestone(state, progress);
  const shareAddon = document.querySelector("#shareAddon");
  shareAddon.classList.toggle("is-hidden", !milestone);
  shareAddon.dataset.milestone = milestone || "";
  if (milestone) {
    document.querySelector("#shareAddonLabel").textContent = milestone === 1
      ? t("1 day! Share your receipt")
      : t("{days} days! Share your receipt", { days: milestone });
  }
  document.querySelector("#goalAddon").classList.toggle("is-hidden", Boolean(milestone) || Boolean(readGoal()) || state.notStoppedYet);
}

function toggleBreakdown() {
  const toggle = document.querySelector("#totalToggle");
  if (!toggle.classList.contains("is-interactive")) return;
  const open = document.querySelector("#breakdown").classList.toggle("is-hidden") === false;
  toggle.setAttribute("aria-expanded", String(open));
  haptics.select();
}

function initInteractiveReceipt() {
  const total = document.querySelector("#totalToggle");
  total.addEventListener("click", toggleBreakdown);
  total.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggleBreakdown(); }
  });

  document.querySelector("#goalAddon").addEventListener("click", () => document.querySelector("#goalButton").click());
  // Health benefits can be hidden right on the receipt, not only in the menu.
  document.querySelector("#benefitsClose").addEventListener("click", (event) => {
    event.stopPropagation();
    elements.showBenefitsToggle.checked = false;
    elements.showBenefitsToggle.dispatchEvent(new Event("input", { bubbles: true }));
    haptics.select();
  });
  document.querySelector("#shareAddon").addEventListener("click", (event) => {
    localStorage.setItem(SHARE_PROMPT_KEY, event.currentTarget.dataset.milestone);
    elements.downloadButton.click();
    updateReceipt(false);
  });
  elements.receiptGoal.addEventListener("click", () => document.querySelector("#goalButton").click());

  // iOS Safari: no pinch zoom, the app should feel fixed in place.
  ["gesturestart", "gesturechange"].forEach((type) => document.addEventListener(type, (event) => event.preventDefault()));
  // iOS still zooms on a quick second tap in some places, so swallow that second tap.
  let lastTouchEnd = 0;
  document.addEventListener("touchend", (event) => {
    const now = Date.now();
    const isControl = event.target.closest?.("input, textarea, select, button, a, label, [role=button], [contenteditable]");
    if (!isControl && now - lastTouchEnd < 320) event.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
  updateReceipt(false);
}

// ----------------------------------------------------------------- goal ideas
// Spread from a quick treat to a dream, so the ideas do not look alike.
const goalIdeas = [
  { name: "Dinner out", price: 80, icon: "dinner" },
  { name: "Headphones", price: 249, icon: "headphones" },
  { name: "Bicycle", price: 800, icon: "bike" },
  { name: "Vacation", price: 1500, icon: "sun" },
  { name: "Porsche 911", price: 130000, icon: "car" },
  { name: "House", price: 1000000, icon: "house" },
];

function renderGoalIdeas() {
  const cur = getFormState().currencyCode;
  const wrap = document.querySelector("#goalIdeas");
  wrap.innerHTML = "";
  goalIdeas.forEach((idea) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip goal-idea";
    chip.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#i-${idea.icon}"></use></svg><span class="goal-idea__name"></span><small></small>`;
    chip.querySelector(".goal-idea__name").textContent = t(idea.name);
    chip.querySelector("small").textContent = new Intl.NumberFormat(intlLocale(), {
      style: "currency", currency: cur, maximumFractionDigits: 0,
    }).format(idea.price);
    chip.classList.toggle("is-active", elements.goalNameInput.value === t(idea.name));
    chip.addEventListener("click", () => {
      elements.goalNameInput.value = t(idea.name);
      elements.goalPriceInput.value = formatMoneyInput(idea.price);
      elements.goalError.classList.add("is-hidden");
      wrap.querySelectorAll(".goal-idea").forEach((other) => other.classList.toggle("is-active", other === chip));
      haptics.select();
    });
    wrap.append(chip);
  });
}

// Start-up (kept last so every declaration above is initialised).
initTouchEnhancements();
initTools();
initOnboarding();
initMoreMenu();
initHints();
initTabs();
initDiary();
initDevMode();
initExtras();
initInteractiveReceipt();
initBoard();
initToday();
initActions();
initNotificationTaps();
initShareSheet();
initBackNavigation();
initAppearance();
appReady = true;
document.querySelector("#goalButton").addEventListener("click", renderGoalIdeas);
