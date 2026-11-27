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
  // Years, months and days by the calendar, like a birthday: 24 Nov 1972 to 24 Nov 2026 is exactly 54 years.
  const { years: compYears, months: compMonths, days: compDays } = calendarDiff(quitStart, new Date(quitStart.getFullYear(), quitStart.getMonth(), quitStart.getDate() + wholeDays));
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


// ---------------------------------------------------------------------------
// Daily savings, goals and reminder planning (used by the iOS app and the PWA)
// ---------------------------------------------------------------------------

const DAY_MS = 86_400_000;

export function dailySaving(state) {
  if (state.mode === "ryo") return (Number(state.weeklyRyoCost) || 0) / 7;
  if (state.mode === "vaping") {
    const liquid = ((Number(state.mlPerWeek) || 0) / 7) * ((Number(state.costPer10ml) || 0) / 10);
    return liquid + (Number(state.accessoriesPerMonth) || 0) / 30.4375;
  }
  const perPack = Number(state.cigarettesPerPack) || 0;
  if (perPack <= 0) return 0;
  return ((Number(state.cigarettesPerDay) || 0) / perPack) * (Number(state.pricePerPack) || 0);
}

/** Whole years, months and days from one date to a later one, counted on the calendar. */
export function calendarDiff(start, end) {
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) };
}

/** Days from the quit day to its n-th anniversary (calendar years, leap days included). */
export function daysToAnniversary(start, years) {
  const date = new Date(start.getFullYear() + years, start.getMonth(), start.getDate());
  return Math.round((date.getTime() - start.getTime()) / 86_400_000);
}

export function quitStartDate(state) {
  if (state.notStoppedYet || !state.quitDate) return null;
  const date = new Date(`${state.quitDate}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Moment at which the money saved reaches `amount`, or null if it never will. */
export function dateForSavings(state, amount) {
  const start = quitStartDate(state);
  const perDay = dailySaving(state);
  if (!start || perDay <= 0 || amount < 0) return null;
  return new Date(start.getTime() + (amount / perDay) * DAY_MS);
}

export function goalProgress(state, goal, now = new Date()) {
  const price = Number(goal?.price) || 0;
  if (!goal?.name || price <= 0) return null;
  const start = quitStartDate(state);
  const saved = start ? Math.max(0, (now - start) / DAY_MS) * dailySaving(state) : 0;
  const ratio = Math.min(1, saved / price);
  return {
    name: goal.name,
    price,
    saved: Math.min(saved, price),
    ratio,
    reached: saved >= price,
    reachedAt: dateForSavings(state, price),
  };
}

export function asciiBar(ratio, width = 12) {
  const clamped = Math.min(1, Math.max(0, Number(ratio) || 0));
  const filled = Math.round(clamped * width);
  return `[${"#".repeat(filled)}${".".repeat(width - filled)}]`;
}

export const moneyThresholds = [10, 25, 50, 100, 250, 500, 750, 1000, 1500, 2000, 2500, 5000, 7500, 10000, 15000, 20000, 25000, 50000];
export const dayThresholds = [1, 2, 3, 7, 14, 21, 30, 60, 90, 100, 150, 180, 200, 270, 365, 500, 730, 1000, 1095, 1461, 1826, 2000, 2557, 3000, 3652];

const MAX_SCHEDULED = 60; // iOS keeps at most 64 pending local notifications.

/**
 * Builds the list of local notifications to schedule. Pure: no side effects, easy to test.
 * options: { milestones, money, daily: { enabled, hour, minute }, goal, healthMilestones, format, t }
 */
export function buildNotificationPlan(state, options = {}, now = new Date()) {
  const start = quitStartDate(state);
  if (!start) return [];

  const format = options.format || ((value) => value.toFixed(2));
  // Optional translator t(key, vars); the English key is the fallback text.
  const tr = options.t || ((key, vars = {}) => key.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? "")));
  const plan = [];
  const add = (id, at, title, body) => {
    if (at && at.getTime() > now.getTime() + 30_000) plan.push({ id, at, title, body });
  };

  if (options.milestones !== false) {
    dayThresholds.forEach((days, index) => {
      const label = days === 1 ? tr("1 day") : tr("{n} days", { n: days });
      add(1000 + index, new Date(start.getTime() + days * DAY_MS),
        tr("{label} smoke-free", { label }), tr("New line on your receipt. Open SMKFREE to print it."));
    });
    (options.healthMilestones || []).forEach((milestone, index) => {
      add(2000 + index, new Date(start.getTime() + milestone.hours * 3_600_000),
        milestone.title, milestone.detail);
    });
  }

  if (options.money !== false && dailySaving(state) > 0) {
    moneyThresholds.forEach((amount, index) => {
      add(3000 + index, dateForSavings(state, amount),
        tr("{amount} not burned", { amount: format(amount) }), tr("That money stayed in your pocket. Your receipt is ready."));
    });
  }

  const goal = goalProgress(state, options.goal, now);
  if (goal && !goal.reached && goal.reachedAt) {
    add(4000, goal.reachedAt, tr("PAID: {name}", { name: goal.name }),
      tr("You saved {amount}. Treat yourself, you earned it.", { amount: format(goal.price) }));
  }

  if (options.coach === true) {
    buildCoachPlan(start, options.plan || [], tr, now).forEach((tip) => add(tip.id, tip.at, tip.title, tip.body));
  }

  if (options.daily?.enabled) {
    const hour = Number(options.daily.hour ?? 9);
    const minute = Number(options.daily.minute ?? 0);
    for (let offset = 0; offset < 14; offset += 1) {
      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hour, minute);
      const days = Math.floor((at - start) / DAY_MS);
      const saved = Math.max(0, (at - start) / DAY_MS) * dailySaving(state);
      add(5000 + offset, at, tr("Daily receipt"),
        tr("Day {days}: {amount} not burned. Keep the streak printing.", { days, amount: format(saved) }));
    }
  }

  // Evening nudge to check in, skipped on days already checked in (re-planned after each check-in).
  if (options.checkin?.enabled) {
    const done = new Set(options.checkin.doneKeys || []);
    const hour = Number(options.checkin.hour ?? 20);
    for (let offset = 0; offset < 14; offset += 1) {
      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hour, 0);
      if (done.has(dateKey(at))) continue;
      add(7000 + offset, at, tr("Quick check-in?"), tr("One tap: how strong was the urge today?"));
    }
  }

  // Sunday evening: the week receipt is ready (no longer offered in the app, kept for old settings).
  if (options.weekly === true) {
    const daysToSunday = (7 - now.getDay()) % 7;
    for (let week = 0; week < 2; week += 1) {
      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToSunday + week * 7, 19, 0);
      add(7100 + week, at, tr("Your week receipt is ready"), tr("Check-ins, cravings and money not burned this week."));
    }
  }

  return plan.sort((a, b) => a.at - b.at).slice(0, MAX_SCHEDULED);
}

// ---------------------------------------------------------------------------
// If-then plan (implementation intentions): "If <trigger>, then I <action>."
// ---------------------------------------------------------------------------

export const PLAN_MAX_ITEMS = 3;

/** Keeps known trigger/action ids only, one entry per trigger, at most PLAN_MAX_ITEMS. */
export function normalizePlan(raw, triggerIds, actionIds) {
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (result.length === PLAN_MAX_ITEMS) break;
    if (!triggerIds.includes(item?.trigger) || !actionIds.includes(item?.action) || seen.has(item.trigger)) continue;
    seen.add(item.trigger);
    result.push({ trigger: item.trigger, action: item.action });
  }
  return { items: result };
}

// ---------------------------------------------------------------------------
// Quit coach: short local tips, densest in the first week (most relapses happen
// in the first days), then fewer. Reminders are re-planned on every app start,
// so only the next COACH_WINDOW_DAYS are scheduled.
// ---------------------------------------------------------------------------

export const COACH_WINDOW_DAYS = 14;

/** Days after the quit date and local hour of each coach tip. */
export function coachSlots() {
  const slots = [];
  for (let day = 0; day < 7; day += 1) slots.push({ day, hour: 10 }, { day, hour: 18 });
  for (let day = 7; day < 14; day += 1) slots.push({ day, hour: 18 });
  for (let day = 14; day <= 28; day += 2) slots.push({ day, hour: 18 });
  for (let day = 35; day <= 84; day += 7) slots.push({ day, hour: 18 });
  return slots;
}

const COACH_FIRST_WEEK = [
  "cravings", "plan", "move", "firstWeek", "plan", "triggers", "streak",
  "help", "plan", "slip", "move", "streak", "plan", "weekEnd",
];
const COACH_LATER = ["plan", "streak", "move", "slip", "triggers", "plan", "streak", "help"];

/** Text of one coach tip. planItem: { trigger, action } labels or null. */
export function coachTip(kind, { planItem = null, days = 0 } = {}, tr) {
  let title;
  let body;
  switch (kind) {
    case "cravings":
      title = tr("Cravings pass");
      body = tr("A craving peaks and fades within minutes. When it hits, open SOS and ride it out.");
      break;
    case "plan":
      if (planItem) {
        title = tr("Your plan");
        body = tr("{trigger}? You know what to do: {action}.", { trigger: planItem.trigger, action: planItem.action });
      } else {
        title = tr("Make a plan");
        body = tr("Pick the moments when the urge hits and decide now what you do instead. Find it in SOS.");
      }
      break;
    case "move":
      title = tr("Move it");
      body = tr("5 minutes of walking or 10 squats can cut a craving fast, for up to half an hour.");
      break;
    case "firstWeek":
      title = tr("Not a single puff");
      body = tr("Most relapses happen in the first days. One puff often leads to the next, so keep it at zero.");
      break;
    case "triggers":
      title = tr("Know your triggers");
      body = tr("Places and people linked to the habit are the strongest triggers. Plan for them or skip them for now.");
      break;
    case "help":
      title = tr("Get backup");
      body = tr("Nicotine patches, gum or prescribed medication can roughly double your chances. Ask a pharmacy or doctor.");
      break;
    case "slip":
      title = tr("Slipped?");
      body = tr("One slip does not erase your progress. Do not let it turn into the next one. Start again right now.");
      break;
    case "streak":
      title = tr("{days} days strong", { days: days });
      body = tr("Every day without it proves you can do it. Keep going.");
      break;
    default:
      title = tr("Almost one week");
      body = tr("Withdrawal is usually strongest in the first week and fades over the next few weeks.");
  }
  return { title, body };
}

/**
 * One tip per day for the start page, following the same rotation as the coach messages.
 * plan: [{ trigger, action }] with display labels.
 */
export function dailyTip(daysFree, plan, tr) {
  const day = Math.max(0, Math.floor(Number(daysFree) || 0));
  const kind = day < 7 ? COACH_FIRST_WEEK[(day * 2) % COACH_FIRST_WEEK.length] : COACH_LATER[day % COACH_LATER.length];
  const planItem = kind === "plan" && plan.length ? plan[day % plan.length] : null;
  return { kind, ...coachTip(kind, { planItem, days: day }, tr) };
}

/**
 * Coach tips due between now and now + COACH_WINDOW_DAYS.
 * plan: [{ trigger, action }] with display labels, used for personal "if-then" tips.
 */
export function buildCoachPlan(start, plan, tr, now = new Date()) {
  const until = now.getTime() + COACH_WINDOW_DAYS * DAY_MS;
  let planTips = 0;
  const tips = [];

  coachSlots().forEach((slot, index) => {
    const kind = index < COACH_FIRST_WEEK.length
      ? COACH_FIRST_WEEK[index]
      : COACH_LATER[(index - COACH_FIRST_WEEK.length) % COACH_LATER.length];
    // Count plan tips for every slot, so the rotation does not depend on "now".
    const planItem = kind === "plan" && plan.length ? plan[planTips % plan.length] : null;
    if (kind === "plan") planTips += 1;

    const at = new Date(start.getFullYear(), start.getMonth(), start.getDate() + slot.day, slot.hour);
    if (at.getTime() > until) return;

    const { title, body } = coachTip(kind, { planItem, days: slot.day }, tr);
    tips.push({ id: 6000 + index, at, title, body, kind });
  });

  return tips;
}

// ---------------------------------------------------------------------------
// Diary: cravings and slips with strength, trigger and a short note.
// A slip is logged, it never resets the quit date.
// ---------------------------------------------------------------------------

export const DIARY_MAX_ENTRIES = 500;
export const DIARY_NOTE_MAX = 140;
const DIARY_KINDS = ["craving", "slip"];

/** Keeps valid entries only (newest first), so broken or old data never breaks the page. */
export function normalizeDiary(raw, triggerIds) {
  const items = Array.isArray(raw?.entries) ? raw.entries : [];
  const entries = items
    .filter((item) => item && DIARY_KINDS.includes(item.kind) && Number.isFinite(Number(item.at)))
    .map((item) => ({
      id: String(item.id || item.at),
      at: Number(item.at),
      kind: item.kind,
      strength: Number.isInteger(item.strength) && item.strength >= 1 && item.strength <= 5 ? item.strength : null,
      trigger: triggerIds.includes(item.trigger) ? item.trigger : null,
      note: typeof item.note === "string" ? item.note.trim().slice(0, DIARY_NOTE_MAX) : "",
    }))
    .sort((a, b) => b.at - a.at)
    .slice(0, DIARY_MAX_ENTRIES);
  return { entries };
}

/** Part of the day a moment falls into. */
export function dayPart(date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

/** Counts, last 7 days, top triggers and the most common part of the day. */
export function diaryStats(entries, now = new Date()) {
  const weekAgo = now.getTime() - 7 * DAY_MS;
  const triggerCounts = new Map();
  const partCounts = new Map();
  const stats = { cravings: 0, slips: 0, weekCravings: 0, weekSlips: 0, topTriggers: [], dayPart: null };

  entries.forEach((entry) => {
    const isSlip = entry.kind === "slip";
    if (isSlip) stats.slips += 1;
    else stats.cravings += 1;
    if (entry.at >= weekAgo) {
      if (isSlip) stats.weekSlips += 1;
      else stats.weekCravings += 1;
    }
    if (entry.trigger) triggerCounts.set(entry.trigger, (triggerCounts.get(entry.trigger) || 0) + 1);
    const part = dayPart(new Date(entry.at));
    partCounts.set(part, (partCounts.get(part) || 0) + 1);
  });

  stats.topTriggers = [...triggerCounts.entries()]
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count || a.trigger.localeCompare(b.trigger))
    .slice(0, 3);
  const topPart = [...partCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  stats.dayPart = topPart && entries.length >= 3 ? topPart[0] : null;
  return stats;
}

// ----------------------------------------------------------------- health recovery
/**
 * Progress towards each health milestone as a share of the time it takes.
 * A simple linear estimate for motivation: 50 % means halfway to the point in time
 * the source names, not a measured body function.
 */
export function recoveryProgress(milestones, elapsedHours) {
  const hours = Math.max(0, Number(elapsedHours) || 0);
  const items = milestones.map((milestone) => {
    const ratio = milestone.hours > 0 ? Math.min(1, hours / milestone.hours) : 1;
    const percent = ratio >= 1 ? 100 : Math.min(99, Math.floor(ratio * 100));
    return {
      ...milestone,
      ratio,
      percent,
      done: ratio >= 1,
      hoursLeft: Math.max(0, milestone.hours - hours),
    };
  });
  const reached = items.filter((item) => item.done).length;
  return { items, reached, total: items.length, next: items.find((item) => !item.done) || null };
}

// ----------------------------------------------------------------- on-board computer / widget
/** Whole days, hours and minutes in a number of minutes. */
export function splitMinutes(minutes) {
  const total = Math.max(0, Math.floor(Number(minutes) || 0));
  return { days: Math.floor(total / 1440), hours: Math.floor((total % 1440) / 60), minutes: total % 60 };
}

/**
 * Everything the on-board computer (and a later home-screen widget) shows, as plain numbers.
 * Formatting and language stay in the UI, so a native widget can reuse this shape.
 * The third value is estimated life back for cigarettes only (20 min per cigarette, see legal.html);
 * roll-ups and vaping show what was not used instead.
 */
export function boardData(state, progress) {
  const started = !state.notStoppedYet && Boolean(state.quitDate);
  const third = state.mode === "vaping"
    ? { kind: "ml", value: Math.floor(progress.mlNotVaped || 0) }
    : state.mode === "ryo"
    ? { kind: "rolls", value: Math.floor(progress.rollsAvoided || 0) }
    : { kind: "life", value: Math.floor(progress.estimatedLifeMinutes || 0), ...splitMinutes(progress.estimatedLifeMinutes) };
  return {
    started,
    days: started ? progress.wholeDays : 0,
    years: started ? progress.compYears : 0,
    months: started ? progress.compMonths : 0,
    restDays: started ? progress.compDays : 0,
    hours: started ? progress.compHours : 0,
    money: started ? progress.moneySaved : 0,
    third,
  };
}

// ----------------------------------------------------------------- daily check-in
// One tap a day: how strong was the urge today? 0 none, 1 light, 2 medium, 3 strong.
// Shown as this week's days, never as a streak that breaks: missing a day costs nothing.
export const CHECKIN_LEVELS = 4;

export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Keeps valid "YYYY-MM-DD": level pairs only, the newest 120 days. */
export function normalizeCheckins(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const entries = Object.entries(raw)
    .filter(([key, level]) => /^\d{4}-\d{2}-\d{2}$/.test(key) && Number.isInteger(level) && level >= 0 && level < CHECKIN_LEVELS)
    .sort(([x], [y]) => (x < y ? 1 : -1))
    .slice(0, 120);
  return Object.fromEntries(entries);
}

/** Monday to Sunday of the current week, each with its level or null. */
export function checkinWeek(checkins, now = new Date()) {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const today = dateKey(now);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
    const key = dateKey(day);
    return { key, level: key in checkins ? checkins[key] : null, isToday: key === today, isFuture: key > today };
  });
}

// ----------------------------------------------------------------- rewards: board display colors
// New display colors unlock on smoke-free days. A small reward, nothing is ever taken away again.
export const BOARD_THEME_UNLOCKS = [
  { theme: "receipt", day: 0 },
  { theme: "amber", day: 0 },
  { theme: "blue", day: 1 },
  { theme: "green", day: 3 },
  { theme: "lcd", day: 7 },
  { theme: "gold", day: 30 },
];

/** Unlocked themes (in order) and the next one to earn. */
export function boardThemeStatus(days) {
  const reached = Math.max(0, Math.floor(Number(days) || 0));
  const unlocked = BOARD_THEME_UNLOCKS.filter((item) => item.day <= reached).map((item) => item.theme);
  const next = BOARD_THEME_UNLOCKS.find((item) => item.day > reached) || null;
  return { unlocked, next, total: BOARD_THEME_UNLOCKS.length };
}

// ----------------------------------------------------------------- week receipt
/**
 * Monday 00:00 until now: check-in days, strong days, cravings resisted, slips,
 * smoke-free time this week and the money it kept in your pocket.
 */
export function weekSummary({ checkins = {}, entries = [], state = {} }, now = new Date()) {
  const week = checkinWeek(checkins, now);
  const weekStart = new Date(`${week[0].key}T00:00:00`);
  const thisWeek = entries.filter((entry) => entry.at >= weekStart.getTime() && entry.at <= now.getTime());
  const start = quitStartDate(state);
  const freeFrom = start ? Math.max(start.getTime(), weekStart.getTime()) : null;
  const freeDays = freeFrom !== null ? Math.max(0, (now.getTime() - freeFrom) / DAY_MS) : 0;
  return {
    weekStart,
    days: week,
    checkinDays: week.filter((day) => day.level !== null).length,
    strongDays: week.filter((day) => day.level === 3).length,
    cravings: thisWeek.filter((entry) => entry.kind === "craving").length,
    slips: thisWeek.filter((entry) => entry.kind === "slip").length,
    freeDays,
    moneySaved: freeDays * dailySaving(state),
  };
}

// ----------------------------------------------------------------- board goals
const LIFE_DAY_STEPS = [1, 2, 3, 7, 14, 30, 60, 90, 180, 365, 730];
const COUNT_STEPS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000];

/** Next step above value and how far along the way from the previous step it is (0..1). */
export function stepProgress(value, steps, repeat = 0) {
  const current = Math.max(0, Number(value) || 0);
  const nextIndex = steps.findIndex((step) => step > current);
  const last = steps[steps.length - 1];
  if (nextIndex < 0 && repeat > 0) {
    // Past the last step: keep going in even steps (e.g. every year), so there is always a next goal.
    const from = last + Math.floor((current - last) / repeat) * repeat;
    return { from, target: from + repeat, ratio: (current - from) / repeat, left: from + repeat - current, done: false };
  }
  if (nextIndex < 0) return { from: last, target: last, ratio: 1, left: 0, done: true };
  const from = nextIndex > 0 ? steps[nextIndex - 1] : 0;
  const target = steps[nextIndex];
  return { from, target, ratio: (current - from) / (target - from), left: target - current, done: false };
}

/**
 * The next goal for each board line, so every number comes with "how far to the next one".
 * goal: the user's savings goal { name, price } or null.
 */
export function boardGoals(state, progress, goal = null) {
  const started = !state.notStoppedYet && Boolean(state.quitDate);
  const days = started ? progress.elapsedHours / 24 : 0;
  let time = stepProgress(days, dayThresholds, 365.25);
  // Past ten years the next goal is the next real anniversary of the quit day.
  const start = quitStartDate(state);
  if (started && start && days >= dayThresholds[dayThresholds.length - 1]) {
    const yearsDone = progress.compYears;
    const from = daysToAnniversary(start, yearsDone);
    const target = daysToAnniversary(start, yearsDone + 1);
    time = { from, target, ratio: (days - from) / (target - from), left: target - days, done: false };
  }
  const money = started ? progress.moneySaved : 0;
  const price = Number(goal?.price) || 0;
  const moneyGoal = goal?.name && price > 0 && money < price
    ? { target: price, ratio: money / price, left: price - money, done: false, name: goal.name }
    : { ...stepProgress(money, moneyThresholds, 10000), name: null };
  const third = state.mode === "vaping"
    ? stepProgress(started ? progress.mlNotVaped : 0, COUNT_STEPS, 10000)
    : state.mode === "ryo"
    ? stepProgress(started ? progress.rollsAvoided : 0, COUNT_STEPS, 10000)
    : stepProgress(started ? progress.estimatedLifeMinutes / 1440 : 0, LIFE_DAY_STEPS, 365.25);
  return {
    started,
    time: { ...time, hoursLeft: time.left * 24 },
    money: moneyGoal,
    third,
  };
}

// ----------------------------------------------------------------- receipt colors
// A fixed palette instead of a free color picker. Three to start with, the rest are rewards.
export const RECEIPT_COLORS = [
  { id: "black", hex: "#111111", day: 0 },
  { id: "blue", hex: "#2563eb", day: 0 },
  { id: "red", hex: "#e11d2a", day: 0 },
  { id: "green", hex: "#16a34a", day: 1 },
  { id: "purple", hex: "#7c3aed", day: 3 },
  { id: "pink", hex: "#e11d74", day: 7 },
  { id: "orange", hex: "#f05a0a", day: 14 },
  { id: "teal", hex: "#0d9488", day: 30 },
];

/** The earlier, darker preset colors, so a saved choice moves to its brighter version. */
export const OLD_RECEIPT_COLORS = {
  "#1d4ed8": "#2563eb", "#c62828": "#e11d2a", "#1b7f3b": "#16a34a", "#6d28d9": "#7c3aed",
  "#c2185b": "#e11d74", "#c2410c": "#f05a0a", "#0f766e": "#0d9488",
};

/** Each preset color with whether it is unlocked after a number of smoke-free days. */
export function receiptColorStatus(days) {
  const reached = Math.max(0, Math.floor(Number(days) || 0));
  const colors = RECEIPT_COLORS.map((color) => ({ ...color, unlocked: color.day <= reached }));
  return { colors, unlocked: colors.filter((color) => color.unlocked).length, total: colors.length };
}

// ----------------------------------------------------------------- receipt fonts and stickers
// Personal touches for the receipt, separate from the app theme. Some are there from the start,
// the rest unlock on smoke-free days. Only system fonts: nothing is downloaded, it works offline.
export const RECEIPT_FONTS = [
  { id: "system", label: "Clean", day: 0, stack: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif" },
  { id: "mono", label: "Receipt", day: 0, stack: "ui-monospace, \"SF Mono\", Menlo, Consolas, \"Cascadia Mono\", monospace" },
  { id: "rounded", label: "Round", day: 3, stack: "ui-rounded, \"SF Pro Rounded\", \"Nunito\", \"Varela Round\", system-ui, sans-serif" },
  { id: "serif", label: "Classic", day: 7, stack: "ui-serif, \"New York\", Georgia, \"Times New Roman\", serif" },
  { id: "typewriter", label: "Typewriter", day: 14, stack: "\"American Typewriter\", \"Courier New\", Courier, monospace" },
];

// One sticker sits on the receipt like a stamp. Nothing that looks like smoke or fire.
// Graphics: Google Noto Emoji (2D SVG), bundled so they look the same everywhere and work offline.
export const RECEIPT_STICKERS = [
  { id: "none", emoji: "", label: "No sticker", day: 0 },
  { id: "sprout", emoji: "🌱", label: "Sprout", day: 0, file: "assets/stickers/emoji_u1f331.svg" },
  { id: "muscle", emoji: "💪", label: "Strong", day: 1, file: "assets/stickers/emoji_u1f4aa.svg" },
  { id: "star", emoji: "⭐", label: "Star", day: 3, file: "assets/stickers/emoji_u2b50.svg" },
  { id: "lungs", emoji: "🫁", label: "Lungs", day: 7, file: "assets/stickers/emoji_u1fac1.svg" },
  { id: "medal", emoji: "🏅", label: "Medal", day: 14, file: "assets/stickers/emoji_u1f3c5.svg" },
  { id: "trophy", emoji: "🏆", label: "Trophy", day: 30, file: "assets/stickers/emoji_u1f3c6.svg" },
  { id: "rocket", emoji: "🚀", label: "Rocket", day: 60, file: "assets/stickers/emoji_u1f680.svg" },
  { id: "diamond", emoji: "💎", label: "Diamond", day: 90, file: "assets/stickers/emoji_u1f48e.svg" },
  { id: "rainbow", emoji: "🌈", label: "Rainbow", day: 180, file: "assets/stickers/emoji_u1f308.svg" },
  { id: "crown", emoji: "👑", label: "Crown", day: 365, file: "assets/stickers/emoji_u1f451.svg" },
];

/** Each item with whether it is unlocked after a number of smoke-free days, and the next one to earn. */
export function unlockStatus(items, days) {
  const reached = Math.max(0, Math.floor(Number(days) || 0));
  const list = items.map((item) => ({ ...item, unlocked: item.day <= reached }));
  return {
    items: list,
    unlocked: list.filter((item) => item.unlocked).length,
    total: list.length,
    next: list.find((item) => !item.unlocked) || null,
  };
}

/** A saved choice only counts while it is unlocked; otherwise the first item (the default). */
export function pickUnlocked(items, id, days) {
  const status = unlockStatus(items, days);
  return status.items.find((item) => item.id === id && item.unlocked) || status.items[0];
}

// Receipt paper. "auto" follows light and dark mode; the others keep their tone in both modes.
export const RECEIPT_PAPERS = [
  { id: "auto", label: "Auto", day: 0, color: "", tone: "auto" },
  { id: "paper", label: "Paper", day: 0, color: "#fbf7ee", tone: "light" },
  { id: "night", label: "Night", day: 0, color: "#1c1c1e", tone: "dark" },
  { id: "sky", label: "Sky", day: 3, color: "#eaf2ff", tone: "light" },
  { id: "rose", label: "Rose", day: 7, color: "#fff0f2", tone: "light" },
];

// ----------------------------------------------------------------- start detail sheets
// Behind the gauge and the money card: the same numbers in more detail. Pure, so they are tested.

/** Smoke-free time as running totals ("6.392 hours", "383.520 minutes"). */
export function timeTotals(elapsedMs) {
  const ms = Math.max(0, Number(elapsedMs) || 0);
  return {
    weeks: Math.floor(ms / (7 * DAY_MS)),
    days: Math.floor(ms / DAY_MS),
    hours: Math.floor(ms / 3_600_000),
    minutes: Math.floor(ms / 60_000),
    seconds: Math.floor(ms / 1000),
  };
}

function addMonths(date, n) {
  const d = new Date(date.getTime());
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return d;
}

/**
 * Squares for the "how long already" grid: one per month on the way to the next full year,
 * or one per year once it is three years or more (so the grid never gets longer than 24 squares or so).
 * done: whole units, partial: share of the running unit (0..1), total: squares to draw.
 */
export function timeGrid(start, now = new Date()) {
  if (!start || now < start) return { unit: "month", done: 0, partial: 0, total: 12 };
  const diff = calendarDiff(start, now);
  const months = diff.years * 12 + diff.months;
  if (months < 36) {
    const from = addMonths(start, months);
    const to = addMonths(start, months + 1);
    const partial = Math.min(1, Math.max(0, (now - from) / (to - from)));
    return { unit: "month", done: months, partial, total: Math.max(12, Math.ceil((months + 1) / 12) * 12) };
  }
  const from = addMonths(start, diff.years * 12);
  const to = addMonths(start, (diff.years + 1) * 12);
  const partial = Math.min(1, Math.max(0, (now - from) / (to - from)));
  return { unit: "year", done: diff.years, partial, total: Math.ceil((diff.years + 1) / 5) * 5 };
}

/**
 * When a savings goal is reached if the daily saving stays the same.
 * date is null when nothing is saved per day (no forecast possible).
 */
export function moneyForecast({ saved, target, perDay, now = new Date() }) {
  const goal = Math.max(0, Number(target) || 0);
  const have = Math.max(0, Number(saved) || 0);
  const ratio = goal > 0 ? Math.min(1, have / goal) : 0;
  const left = Math.max(0, goal - have);
  if (goal > 0 && left === 0) return { ratio: 1, left: 0, days: 0, date: new Date(now.getTime()) };
  if (!(Number(perDay) > 0) || goal <= 0) return { ratio, left, days: null, date: null };
  const days = left / Number(perDay);
  return { ratio, left, days, date: new Date(now.getTime() + days * DAY_MS) };
}

// ----------------------------------------------------------------- start charts
// Two small charts on Start: how strong the urge was (from the daily Suchtprotokoll)
// and when and why it comes (from the diary). Pure, so they are tested.

/**
 * Check-in levels as bars: "week" is Monday to Sunday of this week, "month" the last 30 days up to today.
 * Each day has its level (0..3) or null; average is over the days with a check-in (null if none).
 */
export function checkinHistory(checkins, range = "week", now = new Date()) {
  const today = dateKey(now);
  let first;
  let length;
  if (range === "month") {
    length = 30;
    first = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (length - 1));
  } else {
    length = 7;
    first = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  }
  const days = Array.from({ length }, (_, index) => {
    const date = new Date(first.getFullYear(), first.getMonth(), first.getDate() + index);
    const key = dateKey(date);
    const level = key in checkins && key <= today ? checkins[key] : null;
    return { key, date, level, isToday: key === today, isFuture: key > today };
  });
  const levels = days.map((day) => day.level).filter((level) => level !== null);
  const counts = [0, 1, 2, 3].map((level) => levels.filter((value) => value === level).length);
  const average = levels.length ? levels.reduce((sum, value) => sum + value, 0) / levels.length : null;
  return { range: range === "month" ? "month" : "week", days, counts, recorded: levels.length, average };
}

/**
 * Diary entries of the last `days` days by part of the day and by trigger.
 * parts: morning, afternoon, evening, night with counts (cravings and slips together),
 * triggers: the three most common with counts, total: entries in the window.
 */
export function cravingPattern(entries, now = new Date(), days = 30) {
  const since = now.getTime() - days * DAY_MS;
  const recent = entries.filter((entry) => entry.at >= since && entry.at <= now.getTime());
  const parts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  const triggerCounts = new Map();
  recent.forEach((entry) => {
    parts[dayPart(new Date(entry.at))] += 1;
    if (entry.trigger) triggerCounts.set(entry.trigger, (triggerCounts.get(entry.trigger) || 0) + 1);
  });
  const triggers = [...triggerCounts.entries()]
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count || a.trigger.localeCompare(b.trigger))
    .slice(0, 3);
  const topPart = Object.entries(parts).sort((a, b) => b[1] - a[1])[0];
  return { total: recent.length, parts, topPart: topPart[1] > 0 ? topPart[0] : null, triggers };
}
