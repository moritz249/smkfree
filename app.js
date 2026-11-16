import {
  calculateProgress,
  estimateAdvancedSpend,
  formatLifeSaved,
  hasCompleteSavedState,
  parseDecimal,
  asciiBar,
  buildNotificationPlan,
  dailySaving,
  goalProgress,
} from "./app-core.js";
import {
  configureChrome,
  haptics,
  isNativeApp,
  mirrorAllStorage,
  mirrorStorage,
  notificationPermission,
  notificationsSupported,
  onAppResume,
  replaceScheduledNotifications,
  requestNotificationPermission,
  restoreMirroredStorage,
  shareImageNative,
} from "./native.js";
import { applyTranslations, getLanguage, intlLocale, languages, nextLanguage, setLanguage, t } from "./i18n.js";

// Restore data that iOS may have evicted from WebView storage before anything reads it.
await restoreMirroredStorage();
configureChrome();

const STORAGE_KEY = "smoke-free-progress";
const STORAGE_VERSION = 4;
const GOAL_KEY = "smkfree-goal";
const REMINDERS_KEY = "smkfree-reminders";
const CRAVINGS_KEY = "smkfree-cravings";
const SOS_SECONDS = 180;
const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
let reminderSyncTimer = null;
let sosTimer = null;

const tobaccoMilestones = [
  { hours: 1 / 3, title: "Heart rate drops", detail: "A benefit that can begin within minutes." },
  { hours: 24, title: "Nicotine clears", detail: "Nicotine levels in the blood drop to zero." },
  { hours: 72, title: "Carbon monoxide falls", detail: "Within several days, levels can reach those of a nonsmoker." },
  { hours: 720, title: "Breathing may ease", detail: "Coughing and shortness of breath can decrease over 1–12 months." },
  { hours: 8760, title: "Heart attack risk falls", detail: "Risk drops sharply over 1–2 years after quitting." },
  { hours: 26280, title: "Heart health improves", detail: "Added coronary heart disease risk drops over 3–6 years." },
  { hours: 43800, title: "Stroke risk decreases", detail: "The added risk of stroke continues to fall over time." },
];

const vapingMilestones = [
  { hours: 24, title: "First vape-free day", detail: "One day of practicing a new routine." },
  { hours: 72, title: "Break a routine", detail: "Notice a moment you would usually vape." },
  { hours: 168, title: "One week of choices", detail: "A week of practicing your plan." },
  { hours: 336, title: "Notice your triggers", detail: "Recognize situations linked to vaping." },
  { hours: 720, title: "One month of practice", detail: "Your new routine has had time to grow." },
  { hours: 2160, title: "Keep building", detail: "Each vape-free choice adds to your progress." },
  { hours: 8760, title: "A year of progress", detail: "A year of choosing your own next step." },
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
  smokingStartField: document.querySelector("#smokingStartField"),
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
  minutesFree: document.querySelector("#minutesFree"),
  hoursFree: document.querySelector("#hoursFree"),
  daysFree: document.querySelector("#daysFree"),
  monthsFree: document.querySelector("#monthsFree"),
  yearsFree: document.querySelector("#yearsFree"),
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
  alertMilestones: document.querySelector("#alertMilestones"),
  alertMoney: document.querySelector("#alertMoney"),
  alertDaily: document.querySelector("#alertDaily"),
  alertTime: document.querySelector("#alertTime"),
  alertTimeField: document.querySelector("#alertTimeField"),
  alertsSave: document.querySelector("#alertsSave"),
  sosSheet: document.querySelector("#sosSheet"),
  sosStart: document.querySelector("#sosStart"),
  sosDone: document.querySelector("#sosDone"),
  sosActions: document.querySelector("#sosActions"),
  sosTimer: document.querySelector("#sosTimer"),
  sosCount: document.querySelector("#sosCount"),
  sosWorth: document.querySelector("#sosWorth"),
  breathFill: document.querySelector("#breathFill"),
  breathPhase: document.querySelector("#breathPhase"),
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
}

function syncAdvancedFields() {
  const canUseAdvanced = supportsAdvancedMode(currentMode);
  if (!canUseAdvanced) currentAdvanced = false;

  const showStartDate = canUseAdvanced && currentAdvanced;
  elements.advancedPanel.classList.toggle("is-hidden", !canUseAdvanced);
  elements.advancedMode.disabled = !canUseAdvanced;
  elements.advancedMode.checked = currentAdvanced;
  elements.smokingStartField.classList.toggle("is-hidden", !showStartDate);
  elements.smokingStartDate.disabled = !showStartDate;
  elements.smokingStartDate.max = elements.quitDate.value || todayAsInputValue();

  if (!showStartDate) {
    elements.smokingStartDate.setCustomValidity("");
  } else if (currentMode === "cigarettes") {
    updateCurrencySymbols(advancedCurrencyCode);
  }
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

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: STORAGE_VERSION }));
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
  currentAdvanced = supportsAdvancedMode(currentMode) && Boolean(state.isAdvanced);
  currentCurrency = getEffectiveCurrencyCode(currentMode, currentAdvanced, state.currencyCode);
  const radio = elements.modeRadios.find((r) => r.value === currentMode);
  if (radio) radio.checked = true;
  updateModeCards();

  elements.quitDate.value = state.quitDate || "";
  elements.quitDate.max = todayAsInputValue();
  elements.notStoppedYet.checked = Boolean(state.notStoppedYet);
  elements.advancedMode.checked = currentAdvanced;
  currentShowBenefits = Boolean(state.showBenefits);
  elements.showBenefitsToggle.checked = currentShowBenefits;
  syncBenefitsVisibility();
  elements.smokingStartDate.value = state.smokingStartDate || "";
  elements.smokingStartDate.max = state.quitDate || todayAsInputValue();
  elements.cigarettesPerDay.value = state.cigarettesPerDay || "";
  elements.cigarettesPerPack.value = state.cigarettesPerPack || "";
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

function renderReceipt(progress, state) {
  updateCurrencySymbols(state.currencyCode);
  elements.receiptDate.textContent = new Intl.DateTimeFormat(intlLocale(), {
    dateStyle: "medium", timeStyle: "short",
  }).format(new Date());
  const showAdvancedSpend = state.isAdvanced && supportsAdvancedMode(state.mode) && Boolean(state.smokingStartDate);
  const stillUsingAdvanced = showAdvancedSpend && state.notStoppedYet;
  const stillUsingSpend = stillUsingAdvanced ? estimateAdvancedSpend(state, new Date()) : null;
  const effectiveSpent = stillUsingSpend?.moneySpent ?? progress.moneySpent;
  const effectiveAvgPackPrice = stillUsingSpend?.averagePackPrice ?? progress.averageHistoricPackPrice;

  elements.minutesFree.textContent = numberFormatter.format(progress.compMinutes);
  elements.hoursFree.textContent = numberFormatter.format(progress.compHours);
  elements.daysFree.textContent = numberFormatter.format(progress.compDays);
  elements.monthsFree.textContent = numberFormatter.format(progress.compMonths);
  elements.yearsFree.textContent = numberFormatter.format(progress.compYears);
  elements.moneySaved.textContent = formatCurrency(state.notStoppedYet ? 0 : progress.moneySaved, state.currencyCode);

  const rows = showAdvancedSpend
    ? stillUsingAdvanced
      ? [[t("Start date"), formatDate(state.smokingStartDate)], [t("Status"), t("Still using")]]
      : [[t("Start date"), formatDate(state.smokingStartDate)], [t("Stop date"), formatDate(state.quitDate)]]
    : state.notStoppedYet
    ? [[t("Status"), t("Still using")]]
    : [[t("Quit date"), formatDate(state.quitDate)]];

  if (state.mode === "ryo") {
    if (!state.notStoppedYet) {
      rows.push([t("Roll-ups avoided"), numberFormatter.format(progress.rollsAvoided)]);
    }
    rows.push(
      [t("Roll-ups / day"), numberFormatter.format(state.rollsPerDay)],
      [t("Weekly spend"), formatCurrency(state.notStoppedYet ? state.weeklyRyoCost : progress.weeklyRyoCost, state.currencyCode)],
    );
  } else if (state.mode === "vaping") {
    if (!state.notStoppedYet) {
      rows.push(
        [t("ml not vaped"), `${decimalFormatter.format(progress.mlNotVaped)} ml`],
        [t("Liquid saved"), formatCurrency(progress.liquidSaved, state.currencyCode)],
        [t("Accessories saved"), formatCurrency(progress.accessoriesSaved, state.currencyCode)],
      );
    }
    rows.push(
      [t("ml / week"), `${decimalFormatter.format(state.mlPerWeek)} ml`],
      [t("Cost / 10ml"), formatCurrency(state.costPer10ml, state.currencyCode)],
      [t("Accessories / mo."), formatCurrency(state.accessoriesPerMonth, state.currencyCode)],
    );
  } else {
    rows.push(
      [t("Cigarettes / day"), numberFormatter.format(state.cigarettesPerDay)],
      [t("Cigarettes / pack"), numberFormatter.format(state.cigarettesPerPack)],
      showAdvancedSpend
        ? [t("Avg past pack"), `~ ${formatCurrency(effectiveAvgPackPrice, state.currencyCode)} ${t("avg DE")}`]
        : [t("Pack price"), formatCurrency(state.pricePerPack || 0, state.currencyCode)],
    );
    if (!state.notStoppedYet) {
      rows.push(
        [t("Packs not bought"), `${decimalFormatter.format(progress.packsAvoided)} × ${formatCurrency(state.pricePerPack || 0, state.currencyCode)}`],
      );
    }
  }

  if (!state.notStoppedYet) {
    rows.push([showAdvancedSpend ? t("+ Saved after quit") : t("Cost avoided"), showAdvancedSpend
      ? `+ ${formatCurrency(progress.moneySaved, state.currencyCode)}`
      : formatCurrency(progress.moneySaved, state.currencyCode)]);
  }

  if (showAdvancedSpend) {
    rows.push([stillUsingAdvanced ? t("- Paid so far") : t("- Paid before quit"), `- ${formatCurrency(effectiveSpent, state.currencyCode)}`]);
  }

  const cravings = readCravings();
  if (cravings > 0) {
    rows.push([t("Cravings resisted"), numberFormatter.format(cravings)]);
  }

  renderGoal(state);

  if (!state.notStoppedYet && state.mode === "cigarettes") {
    rows.push(
      [t("Estimated life regained*"), formatLifeSaved(progress.estimatedLifeMinutes)],
      [t("*Population average"), t("Not a personal prediction")],
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

  elements.summaryList.innerHTML = rows
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");
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
    time.textContent = milestone.hours < 1
      ? `${Math.round(milestone.hours * 60)}m`
      : milestone.hours < 48
      ? `${milestone.hours}h`
      : `${Math.round(milestone.hours / 24)}d`;
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

async function createReceiptImageBlob() {
  elements.receipt.classList.add("is-capturing");
  try {
    const canvas = await html2canvas(elements.receipt, {
      backgroundColor: "#fffefa",
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
    });
    return canvasToBlob(canvas);
  } finally {
    elements.receipt.classList.remove("is-capturing");
  }
}

async function shareReceiptImage() {
  const filename = "smoke-free-receipt.png";
  const blob = await createReceiptImageBlob();
  const title = t("SMKFREE Quit Receipt");
  const text = t("Look at my SMKFREE receipt. This is what I didn't spend. Do yours in 30s, no hooks attached.");

  if (isNativeApp && await shareImageNative(blob, { title, text, filename })) {
    return "shared";
  }

  const file = new File([blob], filename, { type: "image/png" });
  const shareData = {
    title,
    text,
    url: "https://moritz249.github.io/smkfree/",
    files: [file],
  };

  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share(shareData);
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

function showStep(index, direction = 0) {
  const activeSteps = getActiveSteps();
  const previousStep = currentStep;
  currentStep = Math.min(Math.max(index, 0), activeSteps.length - 1);
  elements.steps.forEach((step) => step.classList.remove("is-active", "slide-in-left", "slide-in-right"));
  activeSteps[currentStep].classList.add("is-active");
  const slide = direction || Math.sign(currentStep - previousStep);
  if (slide) {
    activeSteps[currentStep].classList.add(slide > 0 ? "slide-in-right" : "slide-in-left");
    haptics.select();
  }
  updateModeCards();

  const total = activeSteps.length;
  const progress = Math.round(((currentStep + 1) / total) * 100);
  elements.stepCounter.textContent = t("Step {n} of {total}", { n: currentStep + 1, total });
  elements.progressFill.style.width = `${progress}%`;
  elements.progressPercent.textContent = `${progress}%`;
  elements.backButton.disabled = currentStep === 0;
  elements.backButton.classList.toggle("is-hidden", currentStep === 0);
  elements.nextButton.textContent = currentStep === 0 ? t("Start") : t("Next");
  elements.nextButton.classList.toggle("is-hidden", currentStep === total - 1);
  elements.receiptButton.classList.toggle("is-hidden", currentStep !== total - 1);
  elements.siteFooter.classList.toggle("is-hidden", currentStep !== 0);
  // On touch devices, auto-focusing pops the keyboard over the step; only do it with a mouse.
  if (!isTouchDevice) window.setTimeout(focusCurrentStepField, 0);
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

function showReceipt(event, { animate = true } = {}) {
  event?.preventDefault();
  event?.stopPropagation();
  document.activeElement?.blur?.();
  updateReceipt();
  elements.appShell.classList.add("is-receipt-view");
  elements.stage.classList.add("is-receipt-only");
  elements.editButton.textContent = t("Edit");
  elements.siteFooter.classList.add("is-hidden");
  if (animate) printReceipt();
  window.scrollTo({ top: 0, behavior: "smooth" });
  showReceiptInstallRow();
  startReceiptRefresh();
}

function startReceiptRefresh() {
  if (receiptRefreshTimer) return;
  receiptRefreshTimer = window.setInterval(() => {
    if (elements.stage.classList.contains("is-receipt-only")) updateReceipt(false);
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
  if (!window.confirm(t("Reset your saved receipt? Goal, reminders and craving count are deleted too."))) return;
  haptics.warning();
  [STORAGE_KEY, THEME_KEY, CUSTOM_COLOR_KEY, GOAL_KEY, REMINDERS_KEY, CRAVINGS_KEY]
    .forEach((key) => localStorage.removeItem(key));
  mirrorAllStorage();
  replaceScheduledNotifications([]);

  stopReceiptRefresh();
  elements.stage.classList.remove("is-receipt-only");
  elements.appShell.classList.remove("is-receipt-view");
  if (receiptInstallRow) receiptInstallRow.classList.add("is-hidden");

  const defaultState = readState();
  setFormState(defaultState);
  setQuitDateError("");
  customColorInput.value = "#7c3aed";
  applyCustomThemeVars(customColorInput.value);
  applyTheme("default");
  updateReceipt(false);
  showStep(0);
  elements.appShell.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Mode radio change
elements.modeRadios.forEach((radio) => {
  radio.addEventListener("input", () => {
    currentMode = radio.value;
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
elements.receiptButton.addEventListener("click", showReceipt);
elements.resetButton.addEventListener("click", resetApp);
elements.form.addEventListener("input", () => updateReceipt());
elements.editButton.addEventListener("click", () => {
  elements.stage.classList.remove("is-receipt-only");
  elements.appShell.classList.remove("is-receipt-view");
  elements.editButton.textContent = t("Edit");
  stopReceiptRefresh();
});
elements.downloadButton.addEventListener("click", async () => {
  elements.downloadButton.textContent = t("Preparing");
  try {
    const result = await shareReceiptImage();
    elements.downloadButton.textContent = result === "shared" ? t("Shared") : t("Downloaded");
  } catch (error) {
    elements.downloadButton.textContent = error?.name === "AbortError" ? t("Share") : t("Share failed");
  }
  window.setTimeout(() => { elements.downloadButton.textContent = t("Share"); }, 1600);
});

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
  const inkL = Math.min(l, 0.37);
  const inkS = Math.max(s, 0.35);
  const inkHex    = hslToHex(h, inkS, inkL);
  const mutedHex  = hslToHex(h, inkS * 0.65, Math.min(inkL + 0.22, 0.65));
  const paperHex  = hslToHex(h, Math.min(s * 0.8 + 0.1, 0.55), 0.964);
  const receiptHex = hslToHex(h, Math.min(s * 0.4 + 0.05, 0.25), 0.987);
  const dotBgHex  = hslToHex(h, Math.max(s, 0.5), Math.min(Math.max(l + 0.1, 0.58), 0.76));
  const ri = parseInt(inkHex.slice(1, 3), 16);
  const gi = parseInt(inkHex.slice(3, 5), 16);
  const bi = parseInt(inkHex.slice(5, 7), 16);

  const el = elements.receipt;
  el.style.setProperty("--custom-ink", inkHex);
  el.style.setProperty("--custom-muted", mutedHex);
  el.style.setProperty("--custom-paper", paperHex);
  el.style.setProperty("--custom-receipt", receiptHex);
  el.style.setProperty("--custom-shadow", `8px 10px 0 rgba(${ri}, ${gi}, ${bi}, 0.35)`);

  if (customColorLabel) {
    customColorLabel.style.borderColor = inkHex;
    customColorLabel.style.color = inkHex;
    customColorLabel.style.background = dotBgHex;
  }
}

function onColorChange() {
  const hex = customColorInput.value;
  applyCustomThemeVars(hex);
  localStorage.setItem(CUSTOM_COLOR_KEY, hex);
  localStorage.setItem(THEME_KEY, "custom");
  mirrorStorage(CUSTOM_COLOR_KEY);
  mirrorStorage(THEME_KEY);
  applyTheme("custom");
}

customColorInput.addEventListener("input", onColorChange);
customColorInput.addEventListener("change", onColorChange);


const savedCustomColor = localStorage.getItem(CUSTOM_COLOR_KEY) || "#7c3aed";
customColorInput.value = savedCustomColor;
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
}

function switchLanguage() {
  setLanguage(nextLanguage());
  refreshFormatters();
  syncLanguageButton();
  updateCurrencySymbols(currentCurrency);
  updateReceipt(false);
  showStep(currentStep);
  haptics.select();
}

languageButton.addEventListener("click", switchLanguage);
applyTranslations();
syncLanguageButton();

const initialState = readState();
setFormState(initialState);
updateReceipt(false);

if (hasCompleteSavedState(initialState)) {
  showStep(getActiveSteps().length - 1);
  showReceipt(null, { animate: true });
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
  return elements.stage.classList.contains("is-receipt-only");
}

// ----------------------------------------------------------------- printing
function printReceipt() {
  const feed = elements.receiptFeed;
  if (!feed || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  feed.classList.remove("is-printing");
  void feed.offsetWidth;
  feed.classList.add("is-printing");
  haptics.printer(18, 45);
  feed.addEventListener("animationend", () => feed.classList.remove("is-printing"), { once: true });
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
  document.body.classList.add("has-sheet");
}

function closeSheet(animate = true) {
  const sheet = openSheetEl;
  if (!sheet) return;
  openSheetEl = null;
  if (sheet === elements.sosSheet) stopSos();
  sheet.classList.remove("is-open");
  elements.sheetBackdrop.classList.remove("is-open");
  document.body.classList.remove("has-sheet");
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
    milestones: true,
    money: true,
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
    ? buildNotificationPlan(state, {
      milestones: reminders.milestones,
      money: reminders.money,
      daily: reminders.daily,
      goal: readGoal(),
      healthMilestones: (state.mode === "vaping" ? vapingMilestones : tobaccoMilestones)
        .map((m) => ({ ...m, title: t(m.title), detail: t(m.detail) })),
      format: (value) => formatCurrency(value, state.currencyCode),
      t,
    })
    : [];
  return replaceScheduledNotifications(plan);
}

const notificationsOffText = "Notifications are off for SMKFREE. Turn them on in your phone settings.";

async function openAlertsSheet() {
  const reminders = readReminders();
  elements.alertMilestones.checked = reminders.milestones;
  elements.alertMoney.checked = reminders.money;
  elements.alertDaily.checked = reminders.daily.enabled;
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
    milestones: elements.alertMilestones.checked,
    money: elements.alertMoney.checked,
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
  { label: "Breathe in", seconds: 4, fill: 100 },
  { label: "Hold", seconds: 4, fill: 100 },
  { label: "Breathe out", seconds: 6, fill: 0 },
];

function formatClock(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function openSos() {
  const state = getFormState();
  const worth = cravingWorth(state);
  elements.sosCount.textContent = numberFormatter.format(readCravings());
  elements.sosWorth.textContent = worth ? formatCurrency(worth, state.currencyCode) : t("Your next step");
  resetSosUi();
  openSheet(elements.sosSheet);
}

function resetSosUi() {
  elements.sosTimer.textContent = formatClock(SOS_SECONDS);
  elements.breathPhase.textContent = t("Ready");
  elements.breathFill.style.transition = "none";
  elements.breathFill.style.width = "0%";
  elements.sosStart.textContent = t("Start");
  elements.sosDone.classList.add("is-hidden");
}

function startSos() {
  if (sosTimer) return;
  const startedAt = Date.now();
  let phaseIndex = -1;
  let phaseEndsAt = startedAt;
  elements.sosStart.textContent = t("Restart");

  const tick = () => {
    const now = Date.now();
    const elapsed = Math.floor((now - startedAt) / 1000);
    const remaining = Math.max(0, SOS_SECONDS - elapsed);
    elements.sosTimer.textContent = formatClock(remaining);

    if (now >= phaseEndsAt && remaining > 0) {
      phaseIndex = (phaseIndex + 1) % breathPattern.length;
      const phase = breathPattern[phaseIndex];
      phaseEndsAt = now + phase.seconds * 1000;
      elements.breathPhase.textContent = t(phase.label);
      elements.breathFill.style.transition = `width ${phase.seconds}s linear`;
      elements.breathFill.style.width = `${phase.fill}%`;
      if (phaseIndex === 0) haptics.press();
      else haptics.tap();
    }

    if (elapsed >= 45) elements.sosDone.classList.remove("is-hidden");
    if (remaining === 0) {
      stopSos();
      elements.breathPhase.textContent = t("Craving passed");
      elements.sosDone.classList.remove("is-hidden");
      haptics.success();
    }
  };
  tick();
  sosTimer = window.setInterval(tick, 250);
}

function stopSos() {
  window.clearInterval(sosTimer);
  sosTimer = null;
}

function finishSos() {
  addCraving();
  haptics.success();
  closeSheet();
  updateReceipt(false);
  printReceipt();
  showToast(t("Craving #{n} resisted", { n: readCravings() }));
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
  enableWizardSwipe();

  document.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".primary-button, .secondary-button, .mode-card, .toggle-field")) haptics.tap();
  }, { passive: true });

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

  document.querySelector("#sosButton").addEventListener("click", openSos);
  document.querySelector("#sosClose").addEventListener("click", () => closeSheet());
  elements.sosStart.addEventListener("click", () => { stopSos(); resetSosUi(); startSos(); });
  elements.sosDone.addEventListener("click", finishSos);

  elements.sheetBackdrop.addEventListener("click", () => closeSheet());
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeSheet(); });
  [elements.goalSheet, elements.alertsSheet, elements.sosSheet].forEach(enableSwipeToClose);

  onAppResume(() => {
    if (isReceiptVisible()) updateReceipt(false);
    syncReminders();
  });

  if (isReceiptVisible()) maybeOfferReminders();
  elements.receiptButton.addEventListener("click", maybeOfferReminders);
  syncReminders();
}

// Start-up (kept last so every declaration above is initialised).
initTouchEnhancements();
initTools();
