export const germanPackPriceAnchors = [
  { year: 1990, price: 2.15 }, { year: 1995, price: 2.55 }, { year: 2000, price: 2.95 },
  { year: 2002, price: 3.16 }, { year: 2005, price: 4.21 }, { year: 2010, price: 5.00 },
  { year: 2015, price: 6.00 }, { year: 2020, price: 7.00 }, { year: 2022, price: 7.60 },
  { year: 2024, price: 8.70 }, { year: 2025, price: 9.40 },
];

export function parseDecimal(value) {
  const normalized = String(value).trim().replace(",", ".");
  const parsed = Number(normalized);
  return normalized !== "" && Number.isFinite(parsed) ? parsed : null;
}

function decimalYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const next = new Date(date.getFullYear() + 1, 0, 1);
  return date.getFullYear() + ((date - start) / (next - start));
}

export function estimateGermanPackPrice20At(date) {
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

export function estimateAdvancedSpend(state, quitStart) {
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

export function formatLifeSaved(minutes) {
  const wholeMinutes = Math.floor(minutes);
  const days = Math.floor(wholeMinutes / 1440);
  const hours = Math.floor((wholeMinutes % 1440) / 60);
  const mins = wholeMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function hasCompleteSavedState(state) {
  const hasValue = (value) => value !== "" && value !== null && value !== undefined;
  const hasDateState = Boolean(state.notStoppedYet || state.quitDate);
  if (!hasDateState) return false;

  if (state.mode === "ryo") {
    return Number(state.rollsPerDay) > 0 && hasValue(state.weeklyRyoCost) && Number.isFinite(Number(state.weeklyRyoCost)) && Number(state.weeklyRyoCost) >= 0;
  }

  if (state.mode === "vaping") {
    return Number(state.mlPerWeek) > 0
      && hasValue(state.costPer10ml) && Number.isFinite(Number(state.costPer10ml)) && Number(state.costPer10ml) >= 0
      && hasValue(state.accessoriesPerMonth)
      && Number(state.accessoriesPerMonth) >= 0;
  }

  return Number(state.cigarettesPerDay) > 0
    && Number(state.cigarettesPerPack) > 0
    && hasValue(state.pricePerPack) && Number.isFinite(Number(state.pricePerPack)) && Number(state.pricePerPack) >= 0;
}

export function calculateProgress(state, now = new Date()) {
  const empty = {
    elapsedMs: 0, elapsedHours: 0, wholeDays: 0, weeks: 0, months: 0, years: 0,
    compYears: 0, compMonths: 0, compDays: 0, compHours: 0, compMinutes: 0,
    moneySaved: 0, estimatedLifeMinutes: 0,
    cigarettesAvoided: 0, packsAvoided: 0,
    moneySpent: 0, averageHistoricPackPrice: 0, smokingDays: 0,
    rollsAvoided: 0, weeklyRyoCost: 0,
    mlNotVaped: 0, liquidSaved: 0, accessoriesSaved: 0,
  };

  if (state.notStoppedYet || !state.quitDate) return empty;

  const quitStart = new Date(`${state.quitDate}T00:00:00`);
  const elapsedMs = Math.max(0, now.getTime() - quitStart.getTime());
  const elapsedDays = elapsedMs / 86_400_000;
  const wholeDays = Math.floor(elapsedDays);
  const compYears = Math.floor(wholeDays / 365.25);
  const daysAfterYears = wholeDays - compYears * 365.25;
  const compMonths = Math.floor(daysAfterYears / 30.4375);
  const compDays = Math.floor(daysAfterYears - compMonths * 30.4375);
  const compHours = Math.floor((elapsedMs % 86_400_000) / 3_600_000);
  const compMinutes = Math.floor((elapsedMs % 3_600_000) / 60_000);
  const base = {
    elapsedMs,
    elapsedHours: elapsedMs / 3_600_000,
    wholeDays,
    weeks: Math.floor(wholeDays / 7),
    months: Math.floor(wholeDays / 30.4375),
    years: compYears,
    compYears, compMonths, compDays, compHours, compMinutes,
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
      estimatedLifeMinutes: 0,
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
    estimatedLifeMinutes: cigarettesAvoided * 20,
  };
}

