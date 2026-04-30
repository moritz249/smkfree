const STORAGE_KEY = "smoke-free-progress";
const STORAGE_VERSION = 2;

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
  printButton: document.querySelector("#printButton"),
  downloadButton: document.querySelector("#downloadButton"),
  stepCounter: document.querySelector("#stepCounter"),
  progressFill: document.querySelector("#progressFill"),
  steps: [...document.querySelectorAll(".step")],
  quitDate: document.querySelector("#quitDate"),
  cigarettesPerDay: document.querySelector("#cigarettesPerDay"),
  cigarettesPerPack: document.querySelector("#cigarettesPerPack"),
  pricePerPack: document.querySelector("#pricePerPack"),
  currencyCode: document.querySelector("#currencyCode"),
  currencySymbol: document.querySelector("#currencySymbol"),
  summaryQuitDate: document.querySelector("#summaryQuitDate"),
  summaryCigarettesPerDay: document.querySelector("#summaryCigarettesPerDay"),
  summaryCigarettesPerPack: document.querySelector("#summaryCigarettesPerPack"),
  summaryPackPrice: document.querySelector("#summaryPackPrice"),
  receiptDate: document.querySelector("#receiptDate"),
  receiptQuitDate: document.querySelector("#receiptQuitDate"),
  receiptPackPrice: document.querySelector("#receiptPackPrice"),
  costAvoided: document.querySelector("#costAvoided"),
  lifeSaved: document.querySelector("#lifeSaved"),
  moneySaved: document.querySelector("#moneySaved"),
  daysFree: document.querySelector("#daysFree"),
  weeksFree: document.querySelector("#weeksFree"),
  monthsFree: document.querySelector("#monthsFree"),
  yearsFree: document.querySelector("#yearsFree"),
  cigarettesAvoided: document.querySelector("#cigarettesAvoided"),
  packsAvoided: document.querySelector("#packsAvoided"),
  milestoneList: document.querySelector("#milestoneList"),
  nextMilestone: document.querySelector("#nextMilestone"),
  receipt: document.querySelector("#receipt"),
  barcodeSvg: document.querySelector("#barcodeSvg"),
  barcodeText: document.querySelector("#barcodeText"),
};

let currentStep = 0;

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const code39 = {
  "0": "nnnwwnwnn",
  "1": "wnnwnnnnw",
  "2": "nnwwnnnnw",
  "3": "wnwwnnnnn",
  "4": "nnnwwnnnw",
  "5": "wnnwwnnnn",
  "6": "nnwwwnnnn",
  "7": "nnnwnnwnw",
  "8": "wnnwnnwnn",
  "9": "nnwwnnwnn",
  A: "wnnnnwnnw",
  B: "nnwnnwnnw",
  C: "wnwnnwnnn",
  D: "nnnnwwnnw",
  E: "wnnnwwnnn",
  F: "nnwnwwnnn",
  G: "nnnnnwwnw",
  H: "wnnnnwwnn",
  I: "nnwnnwwnn",
  J: "nnnnwwwnn",
  K: "wnnnnnnww",
  L: "nnwnnnnww",
  M: "wnwnnnnwn",
  N: "nnnnwnnww",
  O: "wnnnwnnwn",
  P: "nnwnwnnwn",
  Q: "nnnnnnwww",
  R: "wnnnnnwwn",
  S: "nnwnnnwwn",
  T: "nnnnwnwwn",
  U: "wwnnnnnnw",
  V: "nwwnnnnnw",
  W: "wwwnnnnnn",
  X: "nwnnwnnnw",
  Y: "wwnnwnnnn",
  Z: "nwwnwnnnn",
  "-": "nwnnnnwnw",
  ".": "wwnnnnwnn",
  " ": "nwwnnnwnn",
  "*": "nwnnwnwnn",
};

function todayAsInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCurrency(value, currencyCode) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(value);
}

function getCurrencySymbol(currencyCode) {
  const parts = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).formatToParts(0);

  return parts.find((part) => part.type === "currency")?.value || currencyCode;
}

function formatDate(value) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
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

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }

  return `${mins}m`;
}

function readState() {
  const fallback = {
    quitDate: "",
    cigarettesPerDay: "",
    cigarettesPerPack: "",
    pricePerPack: "",
    currencyCode: "EUR",
  };

  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(stored);

    if (parsed.version !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return fallback;
    }

    return {
      ...fallback,
      ...parsed,
      pricePerPack: parsed.pricePerPack ?? fallback.pricePerPack,
      cigarettesPerPack: parsed.cigarettesPerPack ?? fallback.cigarettesPerPack,
    };
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
    quitDate: elements.quitDate.value,
    cigarettesPerDay: Number(elements.cigarettesPerDay.value) || 0,
    cigarettesPerPack: Number(elements.cigarettesPerPack.value) || 0,
    pricePerPack: parseDecimal(elements.pricePerPack.value),
    currencyCode: elements.currencyCode.value,
  };
}

function setFormState(state) {
  elements.quitDate.value = state.quitDate;
  elements.quitDate.max = todayAsInputValue();
  elements.cigarettesPerDay.value = state.cigarettesPerDay;
  elements.cigarettesPerPack.value = state.cigarettesPerPack;
  elements.pricePerPack.value = state.pricePerPack;
  elements.currencyCode.value = state.currencyCode || "EUR";
  elements.currencySymbol.textContent = getCurrencySymbol(elements.currencyCode.value);
}

function calculateProgress(state) {
  if (!state.quitDate) {
    return {
      elapsedHours: 0,
      wholeDays: 0,
      weeks: 0,
      months: 0,
      years: 0,
      cigarettesAvoided: 0,
      packsAvoided: 0,
      moneySaved: 0,
      estimatedLifeMinutes: 0,
    };
  }

  const quitStart = new Date(`${state.quitDate}T00:00:00`);
  const now = new Date();
  const elapsedMs = Math.max(0, now - quitStart);
  const elapsedDays = elapsedMs / 86_400_000;
  const wholeDays = Math.floor(elapsedDays);
  const cigarettesAvoided = elapsedDays * state.cigarettesPerDay;
  const packsAvoided = state.cigarettesPerPack > 0
    ? cigarettesAvoided / state.cigarettesPerPack
    : 0;
  const moneySaved = packsAvoided * state.pricePerPack;
  const estimatedLifeMinutes = cigarettesAvoided * 11;

  return {
    elapsedHours: elapsedMs / 3_600_000,
    wholeDays,
    weeks: Math.floor(wholeDays / 7),
    months: Math.floor(wholeDays / 30.4375),
    years: Math.floor(wholeDays / 365.25),
    cigarettesAvoided,
    packsAvoided,
    moneySaved,
    estimatedLifeMinutes,
  };
}

function renderReceipt(progress, state) {
  elements.currencySymbol.textContent = getCurrencySymbol(state.currencyCode);
  elements.receiptDate.textContent = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  elements.receiptQuitDate.textContent = formatDate(state.quitDate);
  elements.daysFree.textContent = numberFormatter.format(progress.wholeDays);
  elements.weeksFree.textContent = numberFormatter.format(progress.weeks);
  elements.monthsFree.textContent = numberFormatter.format(progress.months);
  elements.yearsFree.textContent = numberFormatter.format(progress.years);
  elements.cigarettesAvoided.textContent = numberFormatter.format(progress.cigarettesAvoided);
  elements.packsAvoided.textContent = decimalFormatter.format(progress.packsAvoided);
  elements.receiptPackPrice.textContent = formatCurrency(state.pricePerPack, state.currencyCode);
  elements.moneySaved.textContent = formatCurrency(progress.moneySaved, state.currencyCode);
  elements.costAvoided.textContent = formatCurrency(progress.moneySaved, state.currencyCode);
  elements.lifeSaved.textContent = formatLifeSaved(progress.estimatedLifeMinutes);
  renderBarcode(state, progress);
}

function buildReceiptCode(state, progress) {
  return `SMK-${compactDate(state.quitDate)}-${String(Math.floor(progress.cigarettesAvoided)).padStart(3, "0").slice(-3)}`;
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
  elements.summaryQuitDate.textContent = formatDate(state.quitDate);
  elements.summaryCigarettesPerDay.textContent = numberFormatter.format(state.cigarettesPerDay);
  elements.summaryCigarettesPerPack.textContent = numberFormatter.format(state.cigarettesPerPack);
  elements.summaryPackPrice.textContent = formatCurrency(state.pricePerPack, state.currencyCode);
}

function renderMilestones(elapsedHours) {
  const next = milestones.find((milestone) => milestone.hours > elapsedHours);

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

  if (shouldSave) {
    writeState(state);
  }

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

async function downloadReceiptImage() {
  const canvas = await html2canvas(elements.receipt, {
    backgroundColor: "#fffefa",
    scale: 2,
    useCORS: true,
    logging: false,
  });
  downloadUrl(canvas.toDataURL("image/png"), "smoke-free-receipt.png");
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
      if (index % 2 === 0) {
        context.fillRect(currentX, y, width, height);
      }
      currentX += width;
    });
    currentX += unit;
  });
}

function showStep(index) {
  currentStep = Math.min(Math.max(index, 0), elements.steps.length - 1);

  elements.steps.forEach((step, stepIndex) => {
    step.classList.toggle("is-active", stepIndex === currentStep);
  });

  elements.stepCounter.textContent = `Step ${currentStep + 1} of ${elements.steps.length}`;
  elements.progressFill.style.width = `${((currentStep + 1) / elements.steps.length) * 100}%`;
  elements.backButton.disabled = currentStep === 0;
  elements.nextButton.classList.toggle("is-hidden", currentStep === elements.steps.length - 1);
  elements.receiptButton.classList.toggle("is-hidden", currentStep !== elements.steps.length - 1);
  window.setTimeout(focusCurrentStepField, 0);
}

function focusCurrentStepField() {
  const field = elements.steps[currentStep].querySelector("input, select");

  if (field) {
    field.focus();
    return;
  }

  if (currentStep === elements.steps.length - 1) {
    elements.receiptButton.focus();
  }
}

function validateCurrentStep() {
  applyDefaultsForCurrentStep();

  const activeInputs = [...elements.steps[currentStep].querySelectorAll("input, select")];
  return activeInputs.every((input) => {
    if (input === elements.pricePerPack) {
      const isValid = input.value.trim() !== "" && parseDecimal(input.value) >= 0;
      input.setCustomValidity(isValid ? "" : "Enter a valid pack price.");
    }

    return input.reportValidity();
  });
}

function applyDefaultsForCurrentStep() {
  const activeInputs = [...elements.steps[currentStep].querySelectorAll("input")];

  activeInputs.forEach((input) => {
    if (input.value.trim() !== "") {
      return;
    }

    if (input.type === "date") {
      input.value = todayAsInputValue();
      return;
    }

    if (input.placeholder) {
      input.value = input.placeholder;
    }
  });
}

function resetApp() {
  localStorage.removeItem(STORAGE_KEY);
  setFormState(readState());
  elements.appShell.classList.remove("is-receipt-view");
  elements.stage.classList.remove("is-receipt-only");
  elements.editButton.textContent = "Close details";
  showStep(0);
  updateReceipt(false);
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateCurrentStep()) {
    return;
  }

  updateReceipt();
  elements.appShell.classList.add("is-receipt-view");
  elements.stage.classList.add("is-receipt-only");
  elements.editButton.textContent = "Details";
  elements.receipt.scrollIntoView({ behavior: "smooth", block: "start" });
});

elements.form.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();

  if (currentStep < elements.steps.length - 1) {
    elements.nextButton.click();
    return;
  }

  elements.receiptButton.click();
});

elements.nextButton.addEventListener("click", () => {
  if (!validateCurrentStep()) {
    return;
  }

  updateReceipt();
  showStep(currentStep + 1);
});

elements.backButton.addEventListener("click", () => showStep(currentStep - 1));
elements.resetButton.addEventListener("click", resetApp);
elements.form.addEventListener("input", () => updateReceipt());
elements.editButton.addEventListener("click", () => {
  elements.stage.classList.remove("is-receipt-only");
  elements.appShell.classList.remove("is-receipt-view");
  elements.editButton.textContent = "Details";
});
elements.printButton.addEventListener("click", () => window.print());
elements.downloadButton.addEventListener("click", async () => {
  elements.downloadButton.textContent = "Preparing";
  try {
    await downloadReceiptImage();
    elements.downloadButton.textContent = "Downloaded";
  } catch {
    elements.downloadButton.textContent = "Download failed";
  }

  window.setTimeout(() => {
    elements.downloadButton.textContent = "Download";
  }, 1600);
});

setFormState(readState());
showStep(0);
updateReceipt(false);
