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

  // Sunday evening: the week receipt is ready.
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
export const DIARY_NOTE_MAX = 80;
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
  { theme: "amber", day: 1 },
  { theme: "blue", day: 3 },
  { theme: "green", day: 7 },
  { theme: "lcd", day: 14 },
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
