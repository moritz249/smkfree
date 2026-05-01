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
  advancedMode: document.querySelector("#advancedMode"),
  advancedPanel: document.querySelector("#advancedPanel"),
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
  receiptStartRow: document.querySelector("#receiptStartRow"),
  receiptStartDate: document.querySelector("#receiptStartDate"),
  receiptQuitLabel: document.querySelector("#receiptQuitLabel"),
  receiptQuitDate: document.querySelector("#receiptQuitDate"),
  moneySaved: document.querySelector("#moneySaved"),
  daysFree: document.querySelector("#daysFree"),
  weeksFree: document.querySelector("#weeksFree"),
  monthsFree: document.querySelector("#monthsFree"),
  yearsFree: document.querySelector("#yearsFree"),
  receiptRow2: document.querySelector("#receiptRow2"),
  receiptLabel2: document.querySelector("#receiptLabel2"),
  receiptValue2: document.querySelector("#receiptValue2"),
  receiptRow3: document.querySelector("#receiptRow3"),
  receiptLabel3: document.querySelector("#receiptLabel3"),
  receiptValue3: document.querySelector("#receiptValue3"),
  receiptLabel4: document.querySelector("#receiptLabel4"),
  receiptValue4: document.querySelector("#receiptValue4"),
  costAvoidedLabel: document.querySelector("#costAvoidedLabel"),
  costAvoided: document.querySelector("#costAvoided"),
  receiptSpentRow: document.querySelector("#receiptSpentRow"),
  moneySpent: document.querySelector("#moneySpent"),
  receiptRow6: document.querySelector("#receiptRow6"),
  lifeSaved: document.querySelector("#lifeSaved"),
  milestoneList: document.querySelector("#milestoneList"),
  nextMilestone: document.querySelector("#nextMilestone"),
  receipt: document.querySelector("#receipt"),
  barcodeSvg: document.querySelector("#barcodeSvg"),
  barcodeText: document.querySelector("#barcodeText"),
};

let currentStep = 0;
let currentMode = "cigarettes";
let currentCurrency = "EUR";
let currentAdvanced = false;

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const code39 = {
  "0": "nnnwwnwnn", "1": "wnnwnnnnw", "2": "nnwwnnnnw", "3": "wnwwnnnnn",
  "4": "nnnwwnnnw", "5": "wnnwwnnnn", "6": "nnwwwnnnn", "7": "nnnwnnwnw",
  "8": "wnnwnnwnn", "9": "nnwwnnwnn", A: "wnnnnwnnw", B: "nnwnnwnnw",
  C: "wnwnnwnnn", D: "nnnnwwnnw", E: "wnnnwwnnn", F: "nnwnwwnnn",
  G: "nnnnnwwnw", H: "wnnnnwwnn", I: "nnwnnwwnn", J: "nnnnwwwnn",
  K: "wnnnnnnww", L: "nnwnnnnww", M: "wnwnnnnwn", N: "nnnnwnnww",
  O: "wnnnwnnwn", P: "nnwnwnnwn", Q: "nnnnnnwww", R: "wnnnnnwwn",
  S: "nnwnnnwwn", T: "nnnnwnwwn", U: "wwnnnnnnw", V: "nwwnnnnnw",
  W: "wwwnnnnnn", X: "nwnnwnnnw", Y: "wwnnwnnnn", Z: "nwwnwnnnn",
  "-": "nwnnnnwnw", ".": "wwnnnnwnn", " ": "nwwnnnwnn", "*": "nwnnwnwnn",
};

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

function compactDate(value) {
  return value ? value.replaceAll("-", "") : "00000000";
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

function readState() {
  const fallback = {
    mode: "cigarettes",
    isAdvanced: false,
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
    return { ...fallback, ...parsed, isAdvanced: Boolean(parsed.isAdvanced) };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return fallback;
  }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: STORAGE_VERSION }));
}

function getFormState() {
  const activeSteps = getActiveSteps();
  const activeCurrencyCode = activeSteps[currentStep]?.querySelector(".currency-code")?.value;
  const isAdvanced = currentAdvanced && supportsAdvancedMode(currentMode);
  const currencyCode = getEffectiveCurrencyCode(currentMode, isAdvanced, activeCurrencyCode || currentCurrency);

  return {
    mode: currentMode,
    isAdvanced,
    quitDate: elements.quitDate.value,
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
  elements.advancedMode.checked = currentAdvanced;
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

  if (!state.quitDate) return empty;

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

function renderReceipt(progress, state) {
  updateCurrencySymbols(state.currencyCode);
  elements.receiptDate.textContent = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium", timeStyle: "short",
  }).format(new Date());
  const showAdvancedSpend = state.isAdvanced && supportsAdvancedMode(state.mode);
  elements.receiptStartRow.classList.toggle("is-hidden", !showAdvancedSpend);
  elements.receiptStartDate.textContent = formatDate(state.smokingStartDate);
  elements.receiptQuitLabel.textContent = showAdvancedSpend ? "Stop date" : "Quit date";
  elements.receiptQuitDate.textContent = formatDate(state.quitDate);
  elements.daysFree.textContent = numberFormatter.format(progress.wholeDays);
  elements.weeksFree.textContent = numberFormatter.format(progress.weeks);
  elements.monthsFree.textContent = numberFormatter.format(progress.months);
  elements.yearsFree.textContent = numberFormatter.format(progress.years);
  elements.moneySaved.textContent = formatCurrency(progress.moneySaved, state.currencyCode);
  elements.costAvoidedLabel.textContent = showAdvancedSpend ? "+ Saved after quit" : "Cost avoided";
  elements.costAvoided.textContent = showAdvancedSpend
    ? `+ ${formatCurrency(progress.moneySaved, state.currencyCode)}`
    : formatCurrency(progress.moneySaved, state.currencyCode);
  elements.receiptSpentRow.classList.toggle("is-hidden", !showAdvancedSpend);
  elements.moneySpent.textContent = `- ${formatCurrency(progress.moneySpent, state.currencyCode)}`;

  if (state.mode === "ryo") {
    elements.receiptLabel2.textContent = "Roll-ups avoided";
    elements.receiptValue2.textContent = numberFormatter.format(progress.rollsAvoided);
    elements.receiptRow3.classList.add("is-hidden");
    elements.receiptLabel4.textContent = "Weekly spend";
    elements.receiptValue4.textContent = formatCurrency(progress.weeklyRyoCost, state.currencyCode);
    elements.receiptRow6.classList.remove("is-hidden");
    elements.lifeSaved.textContent = formatLifeSaved(progress.estimatedLifeMinutes);
  } else if (state.mode === "vaping") {
    elements.receiptLabel2.textContent = "ml not vaped";
    elements.receiptValue2.textContent = decimalFormatter.format(progress.mlNotVaped) + " ml";
    elements.receiptRow3.classList.remove("is-hidden");
    elements.receiptLabel3.textContent = "Liquid saved";
    elements.receiptValue3.textContent = formatCurrency(progress.liquidSaved, state.currencyCode);
    elements.receiptLabel4.textContent = "Accessories";
    elements.receiptValue4.textContent = formatCurrency(progress.accessoriesSaved, state.currencyCode);
    elements.receiptRow6.classList.add("is-hidden");
  } else {
    elements.receiptLabel2.textContent = "Not smoked";
    elements.receiptValue2.textContent = numberFormatter.format(progress.cigarettesAvoided);
    elements.receiptRow3.classList.remove("is-hidden");
    elements.receiptLabel3.textContent = "Packs not bought";
    elements.receiptValue3.textContent = decimalFormatter.format(progress.packsAvoided);
    elements.receiptLabel4.textContent = showAdvancedSpend ? "Avg pack price" : "Pack price";
    elements.receiptValue4.textContent = showAdvancedSpend
      ? `~ ${formatCurrency(progress.averageHistoricPackPrice, state.currencyCode)} avg DE`
      : formatCurrency(state.pricePerPack || 0, state.currencyCode);
    elements.receiptRow6.classList.remove("is-hidden");
    elements.lifeSaved.textContent = formatLifeSaved(progress.estimatedLifeMinutes);
  }

  renderBarcode(state, progress);
}

function buildReceiptCode(state, progress) {
  const prefix = state.mode === "ryo" ? "RYO" : state.mode === "vaping" ? "VAP" : "SMK";
  const count = state.mode === "vaping"
    ? Math.floor(progress.mlNotVaped)
    : state.mode === "ryo"
    ? Math.floor(progress.rollsAvoided)
    : Math.floor(progress.cigarettesAvoided);
  return `${prefix}-${compactDate(state.quitDate)}-${String(count).padStart(3, "0").slice(-3)}`;
}

function renderBarcode(state, progress) {
  const code = buildReceiptCode(state, progress);
  const encoded = `*${code.toUpperCase()}*`;
  const narrow = 2;
  const wide = 5;
  const height = 54;
  let x = 0;
  let markup = "";

  [...encoded].forEach((char) => {
    const pattern = code39[char] || code39["-"];
    [...pattern].forEach((part, index) => {
      const width = part === "w" ? wide : narrow;
      if (index % 2 === 0) {
        markup += `<rect x="${x}" y="0" width="${width}" height="${height}"></rect>`;
      }
      x += width;
    });
    x += narrow;
  });

  elements.barcodeSvg.setAttribute("viewBox", `0 0 ${x} ${height}`);
  elements.barcodeSvg.innerHTML = markup;
  elements.barcodeText.textContent = code;
}

function renderSummary(state) {
  const cur = state.currencyCode || "EUR";
  let rows;
  const advancedProgress = state.isAdvanced ? calculateProgress(state) : null;

  if (state.mode === "ryo") {
    rows = state.isAdvanced
      ? [
        ["Start date", formatDate(state.smokingStartDate)],
        ["Stop date", formatDate(state.quitDate)],
      ]
      : [
        ["Quit date", formatDate(state.quitDate)],
      ];

    rows.push(
      ["Roll-ups / day", numberFormatter.format(state.rollsPerDay)],
      ["Weekly spend", formatCurrency(state.weeklyRyoCost, cur)],
    );
  } else if (state.mode === "vaping") {
    rows = state.isAdvanced
      ? [
        ["Start date", formatDate(state.smokingStartDate)],
        ["Stop date", formatDate(state.quitDate)],
      ]
      : [
        ["Quit date", formatDate(state.quitDate)],
      ];

    rows.push(
      ["ml / week", decimalFormatter.format(state.mlPerWeek) + " ml"],
      ["Cost / 10ml", formatCurrency(state.costPer10ml, cur)],
      ["Accessories / mo.", formatCurrency(state.accessoriesPerMonth, cur)],
    );
  } else {
    rows = state.isAdvanced
      ? [
        ["Start date", formatDate(state.smokingStartDate)],
        ["Stop date", formatDate(state.quitDate)],
      ]
      : [
        ["Quit date", formatDate(state.quitDate)],
      ];

    rows.push(
      ["Cigarettes / day", numberFormatter.format(state.cigarettesPerDay)],
      ["Cigarettes / pack", numberFormatter.format(state.cigarettesPerPack)],
      state.isAdvanced
        ? ["Avg pack price", `~ ${formatCurrency(advancedProgress.averageHistoricPackPrice, cur)} avg DE`]
        : ["Pack price", formatCurrency(state.pricePerPack, cur)],
    );

    if (state.isAdvanced) {
      rows.push(["+ Saved after quit", `+ ${formatCurrency(advancedProgress.moneySaved, cur)}`]);
      rows.push(["- Paid before quit", `- ${formatCurrency(advancedProgress.moneySpent, cur)}`]);
    }
  }

  if (state.isAdvanced && state.mode !== "cigarettes") {
    rows.push(["+ Saved after quit", `+ ${formatCurrency(advancedProgress.moneySaved, cur)}`]);
    rows.push(["- Paid before quit", `- ${formatCurrency(advancedProgress.moneySpent, cur)}`]);
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
    text: "Track smoke-free days, money saved, and your receipt-style progress.",
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

function drawBarcodeOnCanvas(context, code, x, y, maxWidth, height) {
  const encoded = `*${code.toUpperCase()}*`;
  const units = [...encoded].reduce((sum, char) => {
    const pattern = code39[char] || code39["-"];
    return sum + [...pattern].reduce((inner, part) => inner + (part === "w" ? 3 : 1), 0) + 1;
  }, 0);
  const unit = maxWidth / units;
  let currentX = x;
  [...encoded].forEach((char) => {
    const pattern = code39[char] || code39["-"];
    [...pattern].forEach((part, index) => {
      const width = unit * (part === "w" ? 3 : 1);
      if (index % 2 === 0) context.fillRect(currentX, y, width, height);
      currentX += width;
    });
    currentX += unit;
  });
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
    if (input.type === "date") { input.value = todayAsInputValue(); return; }
    if (input.placeholder) input.value = input.placeholder;
  });
}

function showReceipt(event) {
  event?.preventDefault();
  event?.stopPropagation();
  updateReceipt();
  elements.appShell.classList.add("is-receipt-view");
  elements.stage.classList.add("is-receipt-only");
  elements.editButton.textContent = "Details";
  elements.receipt.scrollIntoView({ behavior: "smooth", block: "start" });
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
  localStorage.removeItem(STORAGE_KEY);
  currentMode = "cigarettes";
  currentAdvanced = false;
  setFormState(readState());
  elements.appShell.classList.remove("is-receipt-view");
  elements.stage.classList.remove("is-receipt-only");
  elements.editButton.textContent = "Details";
  showStep(0);
  updateReceipt(false);
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

elements.quitDate.addEventListener("input", () => {
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
  elements.editButton.textContent = "Details";
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

setFormState(readState());
showStep(0);
updateReceipt(false);

// Theme
const THEME_KEY = "smkfree-theme";
const themeDots = document.querySelectorAll(".theme-dot");

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme === "default" ? "" : theme;
  themeDots.forEach((dot) => dot.classList.toggle("is-active", dot.dataset.theme === theme));
}

themeDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const theme = dot.dataset.theme;
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  });
});

applyTheme(localStorage.getItem(THEME_KEY) || "default");
