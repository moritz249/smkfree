const STORAGE_KEY = "smoke-free-progress";
const STORAGE_VERSION = 4;

const tobaccoMilestones = [
  { hours: 8, title: "Oxygen improves", detail: "Carbon monoxide starts dropping." },
  { hours: 24, title: "Pulse steadies", detail: "Your body starts recalibrating." },
  { hours: 48, title: "Taste returns", detail: "Taste and smell can sharpen." },
  { hours: 72, title: "Breathing eases", detail: "Airways may begin to relax." },
  { hours: 336, title: "Circulation improves", detail: "Two weeks smoke free." },
  { hours: 2160, title: "Lungs recover", detail: "Coughing may reduce." },
  { hours: 8760, title: "Risk keeps falling", detail: "One year smoke free." },
];

const vapingMilestones = [
  { hours: 24, title: "Cravings shift", detail: "Nicotine routines begin to loosen." },
  { hours: 72, title: "Breathing settles", detail: "Irritation from vapor may start easing." },
  { hours: 168, title: "Triggers get clearer", detail: "One week without the vape habit." },
  { hours: 336, title: "Energy steadies", detail: "Sleep and daily rhythm may feel more even." },
  { hours: 720, title: "Habit loop fades", detail: "A month of choosing not to vape." },
  { hours: 2160, title: "Lungs get space", detail: "Airways have had months away from vapor." },
  { hours: 8760, title: "New baseline", detail: "One year without vaping." },
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
  daysFree: document.querySelector("#daysFree"),
  weeksFree: document.querySelector("#weeksFree"),
  monthsFree: document.querySelector("#monthsFree"),
  yearsFree: document.querySelector("#yearsFree"),
  milestoneList: document.querySelector("#milestoneList"),
  nextMilestone: document.querySelector("#nextMilestone"),
  receipt: document.querySelector("#receipt"),
  savedNotice: document.querySelector("#savedNotice"),
};

let currentStep = 0;
let currentMode = "cigarettes";
let currentCurrency = "EUR";
let currentAdvanced = false;
let currentShowBenefits = false;
let receiptRefreshTimer = null;
let showSavedNoticeOnOpen = false;

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const decimalInputIds = new Set(["pricePerPack", "weeklyRyoCost", "costPer10ml", "accessoriesPerMonth"]);
const advancedCurrencyCode = "EUR";

const germanPackPriceAnchors = [
  { year: 1990, price: 2.15 },
  { year: 1995, price: 2.55 },
  { year: 2000, price: 2.95 },
  { year: 2002, price: 3.16 },
  { year: 2005, price: 4.21 },
  { year: 2010, price: 5.00 },
  { year: 2015, price: 6.00 },
  { year: 2020, price: 7.00 },
  { year: 2022, price: 7.60 },
  { year: 2024, price: 8.70 },
  { year: 2025, price: 9.40 },
];

function todayAsInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCurrency(value, currencyCode) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(value);
}

function getCurrencySymbol(currencyCode) {
  const parts = new Intl.NumberFormat("en-US", {
    style: "currency", currency: currencyCode, currencyDisplay: "narrowSymbol",
  }).formatToParts(0);
  return parts.find((p) => p.type === "currency")?.value || currencyCode;
}

function formatDate(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric", month: "short", day: "2-digit",
  }).format(new Date(`${value}T00:00:00`));
}

function parseDecimal(value) {
  const normalized = String(value).trim().replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function decimalYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const next = new Date(date.getFullYear() + 1, 0, 1);
  return date.getFullYear() + ((date - start) / (next - start));
}

function estimateGermanPackPrice20At(date) {
  const year = decimalYear(date);
  const first = germanPackPriceAnchors[0];
  const last = germanPackPriceAnchors[germanPackPriceAnchors.length - 1];

  if (year <= first.year) return first.price;
  if (year >= last.year) return last.price;

  for (let index = 1; index < germanPackPriceAnchors.length; index += 1) {
    const previous = germanPackPriceAnchors[index - 1];
    const next = germanPackPriceAnchors[index];

    if (year <= next.year) {
      const ratio = (year - previous.year) / (next.year - previous.year);
      return previous.price + ((next.price - previous.price) * ratio);
    }
  }

  return last.price;
}

function estimateGermanSmokingSpend(state, quitStart) {
  if (!state.isAdvanced || state.currencyCode !== "EUR" || !state.smokingStartDate || state.mode !== "cigarettes") {
    return { moneySpent: 0, averagePackPrice: 0, smokingDays: 0 };
  }

  const start = new Date(`${state.smokingStartDate}T00:00:00`);
  const end = quitStart;

  if (start >= end || state.cigarettesPerDay <= 0 || state.cigarettesPerPack <= 0) {
    return { moneySpent: 0, averagePackPrice: 0, smokingDays: 0 };
  }

  let cursor = new Date(start);
  let moneySpent = 0;
  let weightedPackPrice = 0;
  let smokingDays = 0;

  while (cursor < end) {
    const nextYear = new Date(cursor.getFullYear() + 1, 0, 1);
    const segmentEnd = nextYear < end ? nextYear : end;
    const days = (segmentEnd - cursor) / 86_400_000;
    const pricePer20 = estimateGermanPackPrice20At(cursor);
    const packPrice = pricePer20 * (state.cigarettesPerPack / 20);
    moneySpent += (days * state.cigarettesPerDay / state.cigarettesPerPack) * packPrice;
    weightedPackPrice += packPrice * days;
    smokingDays += days;
    cursor = segmentEnd;
  }

  return {
    moneySpent,
    averagePackPrice: smokingDays > 0 ? weightedPackPrice / smokingDays : 0,
    smokingDays,
  };
}

function estimateAdvancedSpend(state, quitStart) {
  if (!state.isAdvanced || !state.smokingStartDate) {
    return { moneySpent: 0, averagePackPrice: 0, smokingDays: 0 };
  }

  const start = new Date(`${state.smokingStartDate}T00:00:00`);
  if (start >= quitStart) {
    return { moneySpent: 0, averagePackPrice: 0, smokingDays: 0 };
  }

  const smokingDays = (quitStart - start) / 86_400_000;

  if (state.mode === "cigarettes") {
    return estimateGermanSmokingSpend(state, quitStart);
  }

  if (state.mode === "ryo") {
    return {
      moneySpent: (smokingDays / 7) * state.weeklyRyoCost,
      averagePackPrice: 0,
      smokingDays,
    };
  }

  if (state.mode === "vaping") {
    const liquidSpent = (smokingDays / 7) * state.mlPerWeek * (state.costPer10ml / 10);
    const accessoriesSpent = (smokingDays / 30.4375) * state.accessoriesPerMonth;
    return {
      moneySpent: liquidSpent + accessoriesSpent,
      averagePackPrice: 0,
      smokingDays,
    };
  }

  return { moneySpent: 0, averagePackPrice: 0, smokingDays };
}

function formatLifeSaved(minutes) {
  const wholeMinutes = Math.floor(minutes);
  const days = Math.floor(wholeMinutes / 1440);
  const hours = Math.floor((wholeMinutes % 1440) / 60);
  const mins = wholeMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
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
  elements.quitDateError.textContent = message || "Please enter a quit date.";
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

function hasCompleteSavedState(state) {
  const hasValue = (value) => value !== "" && value !== null && value !== undefined;
  const hasDateState = Boolean(state.notStoppedYet || state.quitDate);
  if (!hasDateState) return false;

  if (state.mode === "ryo") {
    return Number(state.rollsPerDay) > 0 && Number(state.weeklyRyoCost) > 0;
  }

  if (state.mode === "vaping") {
    return Number(state.mlPerWeek) > 0
      && Number(state.costPer10ml) > 0
      && hasValue(state.accessoriesPerMonth)
      && Number(state.accessoriesPerMonth) >= 0;
  }

  return Number(state.cigarettesPerDay) > 0
    && Number(state.cigarettesPerPack) > 0
    && Number(state.pricePerPack) > 0;
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: STORAGE_VERSION }));
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
    pricePerPack: parseDecimal(elements.pricePerPack.value),
    rollsPerDay: Number(elements.rollsPerDay.value) || 0,
    weeklyRyoCost: parseDecimal(elements.weeklyRyoCost.value),
    mlPerWeek: Number(elements.mlPerWeek.value) || 0,
    costPer10ml: parseDecimal(elements.costPer10ml.value),
    accessoriesPerMonth: parseDecimal(elements.accessoriesPerMonth.value),
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

function calculateProgress(state) {
  const empty = {
    elapsedHours: 0, wholeDays: 0, weeks: 0, months: 0, years: 0,
    moneySaved: 0, estimatedLifeMinutes: 0,
    cigarettesAvoided: 0, packsAvoided: 0,
    moneySpent: 0, averageHistoricPackPrice: 0, smokingDays: 0,
    rollsAvoided: 0, weeklyRyoCost: 0,
    mlNotVaped: 0, liquidSaved: 0, accessoriesSaved: 0,
  };

  if (state.notStoppedYet || !state.quitDate) return empty;

  const quitStart = new Date(`${state.quitDate}T00:00:00`);
  const elapsedMs = Math.max(0, Date.now() - quitStart);
  const elapsedDays = elapsedMs / 86_400_000;
  const wholeDays = Math.floor(elapsedDays);
  const base = {
    elapsedHours: elapsedMs / 3_600_000,
    wholeDays,
    weeks: Math.floor(wholeDays / 7),
    months: Math.floor(wholeDays / 30.4375),
    years: Math.floor(wholeDays / 365.25),
  };

  if (state.mode === "ryo") {
    const rollsAvoided = elapsedDays * state.rollsPerDay;
    const moneySaved = (elapsedDays / 7) * state.weeklyRyoCost;
    const advancedSpend = estimateAdvancedSpend(state, quitStart);
    return {
      ...empty, ...base,
      rollsAvoided,
      weeklyRyoCost: state.weeklyRyoCost,
      moneySaved,
      moneySpent: advancedSpend.moneySpent,
      smokingDays: advancedSpend.smokingDays,
      estimatedLifeMinutes: rollsAvoided * 11,
    };
  }

  if (state.mode === "vaping") {
    const mlNotVaped = (elapsedDays / 7) * state.mlPerWeek;
    const liquidSaved = mlNotVaped * (state.costPer10ml / 10);
    const accessoriesSaved = (elapsedDays / 30.4375) * state.accessoriesPerMonth;
    const advancedSpend = estimateAdvancedSpend(state, quitStart);
    return {
      ...empty, ...base,
      mlNotVaped,
      liquidSaved,
      accessoriesSaved,
      moneySaved: liquidSaved + accessoriesSaved,
      moneySpent: advancedSpend.moneySpent,
      smokingDays: advancedSpend.smokingDays,
    };
  }

  // Cigarettes
  const cigarettesAvoided = elapsedDays * state.cigarettesPerDay;
  const packsAvoided = state.cigarettesPerPack > 0
    ? cigarettesAvoided / state.cigarettesPerPack : 0;
  const moneySaved = packsAvoided * state.pricePerPack;
  const smokingSpend = estimateAdvancedSpend(state, quitStart);
  return {
    ...empty, ...base,
    cigarettesAvoided,
    packsAvoided,
    moneySaved,
    moneySpent: smokingSpend.moneySpent,
    averageHistoricPackPrice: smokingSpend.averagePackPrice,
    smokingDays: smokingSpend.smokingDays,
    estimatedLifeMinutes: cigarettesAvoided * 11,
  };
}

function renderReceiptRows(rows) {
  elements.receiptRows.innerHTML = rows
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");
}

function renderReceipt(progress, state) {
  updateCurrencySymbols(state.currencyCode);
  elements.receiptDate.textContent = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium", timeStyle: "short",
  }).format(new Date());
  const showAdvancedSpend = state.isAdvanced && supportsAdvancedMode(state.mode) && Boolean(state.smokingStartDate);
  const stillUsingAdvanced = showAdvancedSpend && state.notStoppedYet;
  const stillUsingSpend = stillUsingAdvanced ? estimateAdvancedSpend(state, new Date()) : null;
  const effectiveSpent = stillUsingSpend?.moneySpent ?? progress.moneySpent;
  const effectiveAvgPackPrice = stillUsingSpend?.averagePackPrice ?? progress.averageHistoricPackPrice;

  elements.daysFree.textContent = numberFormatter.format(progress.wholeDays);
  elements.weeksFree.textContent = numberFormatter.format(progress.weeks);
  elements.monthsFree.textContent = numberFormatter.format(progress.months);
  elements.yearsFree.textContent = numberFormatter.format(progress.years);
  elements.moneySaved.textContent = formatCurrency(state.notStoppedYet ? 0 : progress.moneySaved, state.currencyCode);

  const rows = showAdvancedSpend
    ? stillUsingAdvanced
      ? [["Start date", formatDate(state.smokingStartDate)], ["Status", "Still using"]]
      : [["Start date", formatDate(state.smokingStartDate)], ["Stop date", formatDate(state.quitDate)]]
    : state.notStoppedYet
    ? [["Status", "Still using"]]
    : [["Quit date", formatDate(state.quitDate)]];

  if (state.mode === "ryo") {
    if (!state.notStoppedYet) {
      rows.push(["Roll-ups avoided", numberFormatter.format(progress.rollsAvoided)]);
    }
    rows.push(
      ["Roll-ups / day", numberFormatter.format(state.rollsPerDay)],
      ["Weekly spend", formatCurrency(state.notStoppedYet ? state.weeklyRyoCost : progress.weeklyRyoCost, state.currencyCode)],
    );
  } else if (state.mode === "vaping") {
    if (!state.notStoppedYet) {
      rows.push(
        ["ml not vaped", `${decimalFormatter.format(progress.mlNotVaped)} ml`],
        ["Liquid saved", formatCurrency(progress.liquidSaved, state.currencyCode)],
        ["Accessories saved", formatCurrency(progress.accessoriesSaved, state.currencyCode)],
      );
    }
    rows.push(
      ["ml / week", `${decimalFormatter.format(state.mlPerWeek)} ml`],
      ["Cost / 10ml", formatCurrency(state.costPer10ml, state.currencyCode)],
      ["Accessories / mo.", formatCurrency(state.accessoriesPerMonth, state.currencyCode)],
    );
  } else {
    if (!state.notStoppedYet) {
      rows.push(
        ["Not smoked", numberFormatter.format(progress.cigarettesAvoided)],
        ["Packs not bought", decimalFormatter.format(progress.packsAvoided)],
      );
    }
    rows.push(
      ["Cigarettes / day", numberFormatter.format(state.cigarettesPerDay)],
      ["Cigarettes / pack", numberFormatter.format(state.cigarettesPerPack)],
      showAdvancedSpend
        ? ["Avg past pack", `~ ${formatCurrency(effectiveAvgPackPrice, state.currencyCode)} avg DE`]
        : ["Pack price", formatCurrency(state.pricePerPack || 0, state.currencyCode)],
    );
  }

  if (!state.notStoppedYet) {
    rows.push([showAdvancedSpend ? "+ Saved after quit" : "Cost avoided", showAdvancedSpend
      ? `+ ${formatCurrency(progress.moneySaved, state.currencyCode)}`
      : formatCurrency(progress.moneySaved, state.currencyCode)]);
  }

  if (showAdvancedSpend) {
    rows.push([stillUsingAdvanced ? "- Paid so far" : "- Paid before quit", `- ${formatCurrency(effectiveSpent, state.currencyCode)}`]);
  }

  if (!state.notStoppedYet && state.mode !== "vaping") {
    rows.push(["Estimated life back", formatLifeSaved(progress.estimatedLifeMinutes)]);
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
      ? [["Start date", formatDate(state.smokingStartDate)], ["Status", "Still using"]]
      : [["Start date", formatDate(state.smokingStartDate)], ["Stop date", formatDate(state.quitDate)]]
    : state.notStoppedYet
    ? [["Status", "Still using"]]
    : [["Quit date", formatDate(state.quitDate)]];

  if (state.mode === "ryo") {
    rows = [...dateRows];

    rows.push(
      ["Roll-ups / day", numberFormatter.format(state.rollsPerDay)],
      ["Weekly spend", formatCurrency(state.weeklyRyoCost, cur)],
    );
  } else if (state.mode === "vaping") {
    rows = [...dateRows];

    rows.push(
      ["ml / week", decimalFormatter.format(state.mlPerWeek) + " ml"],
      ["Cost / 10ml", formatCurrency(state.costPer10ml, cur)],
      ["Accessories / mo.", formatCurrency(state.accessoriesPerMonth, cur)],
    );
  } else {
    rows = [...dateRows];

    rows.push(
      ["Cigarettes / day", numberFormatter.format(state.cigarettesPerDay)],
      ["Cigarettes / pack", numberFormatter.format(state.cigarettesPerPack)],
      showAdvancedSpend
        ? ["Avg pack price", `~ ${formatCurrency(advancedProgress?.averageHistoricPackPrice ?? advancedData?.averagePackPrice, cur)} avg DE`]
        : ["Pack price", formatCurrency(state.pricePerPack, cur)],
    );

    if (showAdvancedSpend) {
      if (advancedProgress) rows.push(["+ Saved after quit", `+ ${formatCurrency(advancedProgress.moneySaved, cur)}`]);
      rows.push([state.notStoppedYet ? "- Paid so far" : "- Paid before quit", `- ${formatCurrency(advancedData.moneySpent, cur)}`]);
    }
  }

  if (showAdvancedSpend && state.mode !== "cigarettes") {
    if (advancedProgress) rows.push(["+ Saved after quit", `+ ${formatCurrency(advancedProgress.moneySaved, cur)}`]);
    rows.push([state.notStoppedYet ? "- Paid so far" : "- Paid before quit", `- ${formatCurrency(advancedData.moneySpent, cur)}`]);
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
    ? `Next small-print benefit: ${next.title}`
    : "";
  elements.milestoneList.innerHTML = "";

  milestones.forEach((milestone) => {
    const isDone = elapsedHours >= milestone.hours;
    const item = document.createElement("li");
    item.className = `milestone${isDone ? " is-done" : ""}`;

    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = milestone.title;
    const detail = document.createElement("small");
    detail.textContent = milestone.detail;
    copy.append(title, detail);

    const time = document.createElement("span");
    time.textContent = milestone.hours < 48
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
  const file = new File([blob], filename, { type: "image/png" });
  const shareData = {
    title: "SMKFREE Quit Receipt",
    text: "Look at my SMKFREE receipt. This is what I didn't spend. Do yours in 30s, no hooks attached.",
    url: "https://moritz249.github.io/smkfree/",
    files: [file],
  };

  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share(shareData);
      return "shared";
    } catch (error) {
      if (error?.name === "AbortError") {
        throw error;
      }
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  downloadUrl(objectUrl, filename);
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  return "downloaded";
}

function showStep(index) {
  const activeSteps = getActiveSteps();
  currentStep = Math.min(Math.max(index, 0), activeSteps.length - 1);
  elements.steps.forEach((step) => step.classList.remove("is-active"));
  activeSteps[currentStep].classList.add("is-active");
  updateModeCards();

  const total = activeSteps.length;
  elements.stepCounter.textContent = `Step ${currentStep + 1} of ${total}`;
  elements.progressFill.style.width = `${((currentStep + 1) / total) * 100}%`;
  elements.backButton.disabled = currentStep === 0;
  elements.backButton.classList.toggle("is-hidden", currentStep === 0);
  elements.nextButton.textContent = currentStep === 0 ? "Start" : "Next";
  elements.nextButton.classList.toggle("is-hidden", currentStep === total - 1);
  elements.receiptButton.classList.toggle("is-hidden", currentStep !== total - 1);
  elements.siteFooter.classList.toggle("is-hidden", currentStep !== 0);
  window.setTimeout(focusCurrentStepField, 0);
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

    const message = elements.quitDate.value ? "" : "Please enter a quit date.";
    setQuitDateError(message);
    if (message) {
      elements.quitDate.reportValidity();
      return false;
    }
  }

  applyDefaultsForCurrentStep(stepEl);
  const inputs = getStepFields(stepEl);
  return inputs.every((input) => {
    if (input === elements.smokingStartDate) {
      const needsStartDate = currentAdvanced && supportsAdvancedMode(currentMode);
      const isValid = !needsStartDate || (input.value && (!elements.quitDate.value || input.value < elements.quitDate.value));
      input.setCustomValidity(isValid ? "" : "Enter a start date before your quit date.");
    }

    if (decimalInputIds.has(input.id)) {
      const isValid = input.value.trim() !== "" && parseDecimal(input.value) >= 0;
      input.setCustomValidity(isValid ? "" : "Enter a valid amount.");
    }
    return input.reportValidity();
  });
}

function applyDefaultsForCurrentStep(stepEl) {
  [...stepEl.querySelectorAll("input:not([type='radio'])")].forEach((input) => {
    if (input.value.trim() !== "") return;
    if (input.type === "date") return;
    if (input.placeholder) input.value = input.placeholder;
  });
}

function showReceipt(event) {
  event?.preventDefault();
  event?.stopPropagation();
  updateReceipt();
  elements.appShell.classList.add("is-receipt-view");
  elements.stage.classList.add("is-receipt-only");
  elements.editButton.textContent = "Edit";
  elements.savedNotice.classList.toggle("is-hidden", !showSavedNoticeOnOpen);
  showSavedNoticeOnOpen = false;
  elements.siteFooter.classList.add("is-hidden");
  elements.receipt.scrollIntoView({ behavior: "smooth", block: "start" });
  startReceiptRefresh();
}

function startReceiptRefresh() {
  if (receiptRefreshTimer) return;
  receiptRefreshTimer = window.setInterval(() => {
    if (elements.stage.classList.contains("is-receipt-only")) updateReceipt(false);
  }, 30_000);
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

  applyDefaultsForCurrentStep(activeSteps[currentStep]);
  const currentField = fields[fieldIndex];

  if (!currentField.reportValidity()) {
    return true;
  }

  updateReceipt();
  fields[fieldIndex + 1].focus();
  return true;
}

function resetApp() {
  if (!window.confirm("Reset your saved receipt?")) return;
  const savedTheme = localStorage.getItem(THEME_KEY) || "default";
  const savedCustomColor = localStorage.getItem(CUSTOM_COLOR_KEY);
  localStorage.removeItem(STORAGE_KEY);
  stopReceiptRefresh();
  currentMode = "cigarettes";
  currentAdvanced = false;
  setFormState(readState());
  elements.appShell.classList.remove("is-receipt-view");
  elements.stage.classList.remove("is-receipt-only");
  elements.editButton.textContent = "Edit";
  elements.savedNotice.classList.add("is-hidden");
  showStep(0);
  updateReceipt(false);
  if (savedCustomColor) applyCustomThemeVars(savedCustomColor);
  applyTheme(savedTheme);
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
  select.addEventListener("input", () => {
    updateCurrencySymbols(select.value);
    updateReceipt();
  });
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
document.addEventListener("click", (event) => {
  if (!event.target.closest("#receiptButton")) return;
  showReceipt(event);
}, true);
elements.receiptButton.addEventListener("pointerup", showReceipt);
elements.receiptButton.addEventListener("click", showReceipt);
elements.resetButton.addEventListener("click", resetApp);
elements.form.addEventListener("input", () => updateReceipt());
elements.editButton.addEventListener("click", () => {
  elements.stage.classList.remove("is-receipt-only");
  elements.appShell.classList.remove("is-receipt-view");
  elements.editButton.textContent = "Edit";
  elements.savedNotice.classList.add("is-hidden");
  stopReceiptRefresh();
});
elements.downloadButton.addEventListener("click", async () => {
  elements.downloadButton.textContent = "Preparing";
  try {
    const result = await shareReceiptImage();
    elements.downloadButton.textContent = result === "shared" ? "Shared" : "Downloaded";
  } catch (error) {
    elements.downloadButton.textContent = error?.name === "AbortError" ? "Share" : "Share failed";
  }
  window.setTimeout(() => { elements.downloadButton.textContent = "Share"; }, 1600);
});

window.addEventListener("pagehide", saveCurrentState);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  if (elements.stage.classList.contains("is-receipt-only")) updateReceipt(false);
});

const initialState = readState();
setFormState(initialState);
updateReceipt(false);

if (hasCompleteSavedState(initialState)) {
  showStep(getActiveSteps().length - 1);
  showSavedNoticeOnOpen = true;
  showReceipt();
} else {
  showStep(0);
}

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

customColorInput.addEventListener("input", () => {
  const hex = customColorInput.value;
  applyCustomThemeVars(hex);
  localStorage.setItem(CUSTOM_COLOR_KEY, hex);
  localStorage.setItem(THEME_KEY, "custom");
  applyTheme("custom");
});

const savedCustomColor = localStorage.getItem(CUSTOM_COLOR_KEY) || "#7c3aed";
customColorInput.value = savedCustomColor;
applyCustomThemeVars(savedCustomColor);
applyTheme(localStorage.getItem(THEME_KEY) || "default");
