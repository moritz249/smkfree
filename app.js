import {
  calculateProgress,
  estimateAdvancedSpend,
  formatLifeSaved,
  hasCompleteSavedState,
  parseDecimal,
} from "./app-core.js";

const STORAGE_KEY = "smoke-free-progress";
const STORAGE_VERSION = 4;

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
};

let currentStep = 0;
let currentMode = "cigarettes";
let currentCurrency = "EUR";
let currentAdvanced = false;
let currentShowBenefits = false;
let receiptRefreshTimer = null;

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

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
  elements.receiptDate.textContent = new Intl.DateTimeFormat("en-US", {
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
    rows.push(
      ["Cigarettes / day", numberFormatter.format(state.cigarettesPerDay)],
      ["Cigarettes / pack", numberFormatter.format(state.cigarettesPerPack)],
      showAdvancedSpend
        ? ["Avg past pack", `~ ${formatCurrency(effectiveAvgPackPrice, state.currencyCode)} avg DE`]
        : ["Pack price", formatCurrency(state.pricePerPack || 0, state.currencyCode)],
    );
    if (!state.notStoppedYet) {
      rows.push(
        ["Packs not bought", `${decimalFormatter.format(progress.packsAvoided)} × ${formatCurrency(state.pricePerPack || 0, state.currencyCode)}`],
      );
    }
  }

  if (!state.notStoppedYet) {
    rows.push([showAdvancedSpend ? "+ Saved after quit" : "Cost avoided", showAdvancedSpend
      ? `+ ${formatCurrency(progress.moneySaved, state.currencyCode)}`
      : formatCurrency(progress.moneySaved, state.currencyCode)]);
  }

  if (showAdvancedSpend) {
    rows.push([stillUsingAdvanced ? "- Paid so far" : "- Paid before quit", `- ${formatCurrency(effectiveSpent, state.currencyCode)}`]);
  }

  if (!state.notStoppedYet && state.mode === "cigarettes") {
    rows.push(
      ["Estimated life regained*", formatLifeSaved(progress.estimatedLifeMinutes)],
      ["*Population average", "Not a personal prediction"],
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
      if (error?.name === "AbortError") throw error;
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
  const progress = Math.round(((currentStep + 1) / total) * 100);
  elements.stepCounter.textContent = `Step ${currentStep + 1} of ${total}`;
  elements.progressFill.style.width = `${progress}%`;
  elements.progressPercent.textContent = `${progress}%`;
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

  const inputs = getStepFields(stepEl);
  return inputs.every((input) => {
    if (input === elements.smokingStartDate) {
      const needsStartDate = currentAdvanced && supportsAdvancedMode(currentMode);
      const isValid = !needsStartDate || (input.value && (!elements.quitDate.value || input.value < elements.quitDate.value));
      input.setCustomValidity(isValid ? "" : "Enter a start date before your quit date.");
    }

    if (decimalInputIds.has(input.id)) {
      const value = parseDecimal(input.value);
      const isValid = value !== null && value >= 0;
      input.setCustomValidity(isValid ? "" : "Enter a valid amount.");
    }
    return input.reportValidity();
  });
}

function showReceipt(event) {
  event?.preventDefault();
  event?.stopPropagation();
  updateReceipt();
  elements.appShell.classList.add("is-receipt-view");
  elements.stage.classList.add("is-receipt-only");
  elements.editButton.textContent = "Edit";
  elements.siteFooter.classList.add("is-hidden");
  elements.receipt.scrollIntoView({ behavior: "smooth", block: "start" });
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
  if (!window.confirm("Reset your saved receipt?")) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(THEME_KEY);
  localStorage.removeItem(CUSTOM_COLOR_KEY);

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
  elements.editButton.textContent = "Edit";
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
  applyTheme("custom");
}

customColorInput.addEventListener("input", onColorChange);
customColorInput.addEventListener("change", onColorChange);


const savedCustomColor = localStorage.getItem(CUSTOM_COLOR_KEY) || "#7c3aed";
customColorInput.value = savedCustomColor;
applyCustomThemeVars(savedCustomColor);
applyTheme(localStorage.getItem(THEME_KEY) || "default");

// PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}

let deferredInstallPrompt = null;

const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

// Receipt install button
const receiptInstallRow = document.getElementById("receiptInstallRow");

function showReceiptInstallRow() {
  if (isStandalone) return;
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

const initialState = readState();
setFormState(initialState);
updateReceipt(false);

if (hasCompleteSavedState(initialState)) {
  showStep(getActiveSteps().length - 1);
  showReceipt();
} else {
  showStep(0);
}
