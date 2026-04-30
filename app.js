const STORAGE_KEY = "smoke-free-progress";
const STORAGE_VERSION = 3;

const milestones = [
  { hours: 8, title: "Oxygen improves", detail: "Carbon monoxide starts dropping." },
  { hours: 24, title: "Pulse steadies", detail: "Your body starts recalibrating." },
  { hours: 48, title: "Taste returns", detail: "Taste and smell can sharpen." },
  { hours: 72, title: "Breathing eases", detail: "Airways may begin to relax." },
  { hours: 336, title: "Circulation improves", detail: "Two weeks smoke free." },
  { hours: 2160, title: "Lungs recover", detail: "Coughing may reduce." },
  { hours: 8760, title: "Risk keeps falling", detail: "One year smoke free." },
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
  currencyCode: document.querySelector("#currencyCode"),
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
  costAvoided: document.querySelector("#costAvoided"),
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
  const symbol = getCurrencySymbol(currencyCode);
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
    (step) => step.dataset.mode === "all" || step.dataset.mode === currentMode
  );
}

function readState() {
  const fallback = {
    mode: "cigarettes",
    quitDate: "",
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
    return { ...fallback, ...parsed };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return fallback;
  }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: STORAGE_VERSION }));
}

function getFormState() {
  return {
    mode: currentMode,
    quitDate: elements.quitDate.value,
    currencyCode: elements.currencyCode.value,
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
  const radio = elements.modeRadios.find((r) => r.value === currentMode);
  if (radio) radio.checked = true;
  updateModeCards();

  elements.quitDate.value = state.quitDate || "";
  elements.quitDate.max = todayAsInputValue();
  elements.currencyCode.value = state.currencyCode || "EUR";
  elements.cigarettesPerDay.value = state.cigarettesPerDay || "";
  elements.cigarettesPerPack.value = state.cigarettesPerPack || "";
  elements.pricePerPack.value = state.pricePerPack || "";
  elements.rollsPerDay.value = state.rollsPerDay || "";
  elements.weeklyRyoCost.value = state.weeklyRyoCost || "";
  elements.mlPerWeek.value = state.mlPerWeek || "";
  elements.costPer10ml.value = state.costPer10ml || "";
  elements.accessoriesPerMonth.value = state.accessoriesPerMonth || "";
  updateCurrencySymbols(state.currencyCode || "EUR");
}

function calculateProgress(state) {
  const empty = {
    elapsedHours: 0, wholeDays: 0, weeks: 0, months: 0, years: 0,
    moneySaved: 0, estimatedLifeMinutes: 0,
    cigarettesAvoided: 0, packsAvoided: 0,
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
    return {
      ...empty, ...base,
      rollsAvoided,
      weeklyRyoCost: state.weeklyRyoCost,
      moneySaved,
      estimatedLifeMinutes: rollsAvoided * 11,
    };
  }

  if (state.mode === "vaping") {
    const mlNotVaped = (elapsedDays / 7) * state.mlPerWeek;
    const liquidSaved = mlNotVaped * (state.costPer10ml / 10);
    const accessoriesSaved = (elapsedDays / 30.4375) * state.accessoriesPerMonth;
    return {
      ...empty, ...base,
      mlNotVaped,
      liquidSaved,
      accessoriesSaved,
      moneySaved: liquidSaved + accessoriesSaved,
    };
  }

  // Cigarettes
  const cigarettesAvoided = elapsedDays * state.cigarettesPerDay;
  const packsAvoided = state.cigarettesPerPack > 0
    ? cigarettesAvoided / state.cigarettesPerPack : 0;
  const moneySaved = packsAvoided * state.pricePerPack;
  return {
    ...empty, ...base,
    cigarettesAvoided,
    packsAvoided,
    moneySaved,
    estimatedLifeMinutes: cigarettesAvoided * 11,
  };
}

function renderReceipt(progress, state) {
  updateCurrencySymbols(state.currencyCode);
  elements.receiptDate.textContent = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium", timeStyle: "short",
  }).format(new Date());
  elements.receiptQuitDate.textContent = formatDate(state.quitDate);
  elements.daysFree.textContent = numberFormatter.format(progress.wholeDays);
  elements.weeksFree.textContent = numberFormatter.format(progress.weeks);
  elements.monthsFree.textContent = numberFormatter.format(progress.months);
  elements.yearsFree.textContent = numberFormatter.format(progress.years);
  elements.moneySaved.textContent = formatCurrency(progress.moneySaved, state.currencyCode);
  elements.costAvoided.textContent = formatCurrency(progress.moneySaved, state.currencyCode);

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
    elements.receiptLabel4.textContent = "Pack price";
    elements.receiptValue4.textContent = formatCurrency(
      state.pricePerPack || 0, state.currencyCode
    );
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

  if (state.mode === "ryo") {
    rows = [
      ["Quit date", formatDate(state.quitDate)],
      ["Roll-ups / day", numberFormatter.format(state.rollsPerDay)],
      ["Weekly spend", formatCurrency(state.weeklyRyoCost, cur)],
    ];
  } else if (state.mode === "vaping") {
    rows = [
      ["Quit date", formatDate(state.quitDate)],
      ["ml / week", decimalFormatter.format(state.mlPerWeek) + " ml"],
      ["Cost / 10ml", formatCurrency(state.costPer10ml, cur)],
      ["Accessories / mo.", formatCurrency(state.accessoriesPerMonth, cur)],
    ];
  } else {
    rows = [
      ["Quit date", formatDate(state.quitDate)],
      ["Cigarettes / day", numberFormatter.format(state.cigarettesPerDay)],
      ["Cigarettes / pack", numberFormatter.format(state.cigarettesPerPack)],
      ["Pack price", formatCurrency(state.pricePerPack, cur)],
    ];
  }

  elements.summaryList.innerHTML = rows
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");
}

function renderMilestones(elapsedHours) {
  const next = milestones.find((m) => m.hours > elapsedHours);
  elements.nextMilestone.textContent = next
    ? `Next small-print benefit: ${next.title}`
    : "All small-print benefits listed here are checked off.";
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
  renderMilestones(progress.elapsedHours);
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
    text: "My SMKFREE quit receipt.",
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
    .filter((field) => !field.disabled);
}

function validateCurrentStep() {
  const activeSteps = getActiveSteps();
  const stepEl = activeSteps[currentStep];

  if (stepEl.querySelector("input[name='mode']")) return !!currentMode;

  applyDefaultsForCurrentStep(stepEl);
  const inputs = getStepFields(stepEl);
  return inputs.every((input) => {
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
    updateModeCards();
    updateReceipt();
    showStep(currentStep);
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
