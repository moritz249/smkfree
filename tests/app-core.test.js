import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateProgress,
  estimateAdvancedSpend,
  estimateGermanPackPrice20At,
  formatLifeSaved,
  hasCompleteSavedState,
  parseDecimal,
} from "../app-core.js";

const fixedNow = new Date("2026-01-03T00:00:00");

test("parseDecimal accepts dot and comma decimals and rejects invalid or blank input", () => {
  assert.equal(parseDecimal("12.5"), 12.5);
  assert.equal(parseDecimal("12,5"), 12.5);
  assert.equal(parseDecimal(""), null);
  assert.equal(parseDecimal("  "), null);
  assert.equal(parseDecimal("abc"), null);
});

test("saved state accepts a zero cost but requires the relevant consumption values", () => {
  assert.equal(hasCompleteSavedState({ mode: "cigarettes", quitDate: "2026-01-01", cigarettesPerDay: 10, cigarettesPerPack: 20, pricePerPack: 0 }), true);
  assert.equal(hasCompleteSavedState({ mode: "ryo", notStoppedYet: true, rollsPerDay: 5, weeklyRyoCost: 0 }), true);
  assert.equal(hasCompleteSavedState({ mode: "vaping", quitDate: "2026-01-01", mlPerWeek: 10, costPer10ml: 0, accessoriesPerMonth: 0 }), true);
  assert.equal(hasCompleteSavedState({ mode: "cigarettes", quitDate: "2026-01-01", cigarettesPerDay: 0, cigarettesPerPack: 20, pricePerPack: 8 }), false);
});

test("cigarette progress uses elapsed days and entered pack price", () => {
  const progress = calculateProgress({ mode: "cigarettes", quitDate: "2026-01-01", cigarettesPerDay: 10, cigarettesPerPack: 20, pricePerPack: 10 }, fixedNow);
  assert.equal(progress.wholeDays, 2);
  assert.equal(progress.cigarettesAvoided, 20);
  assert.equal(progress.moneySaved, 10);
  assert.equal(progress.estimatedLifeMinutes, 400);
});

test("roll-your-own and vaping progress calculate savings consistently", () => {
  const ryo = calculateProgress({ mode: "ryo", quitDate: "2026-01-01", rollsPerDay: 7, weeklyRyoCost: 14 }, fixedNow);
  assert.equal(ryo.rollsAvoided, 14);
  assert.equal(ryo.moneySaved, 4);
  assert.equal(ryo.estimatedLifeMinutes, 0);

  const vape = calculateProgress({ mode: "vaping", quitDate: "2026-01-01", mlPerWeek: 7, costPer10ml: 10, accessoriesPerMonth: 30.4375 }, fixedNow);
  assert.equal(vape.mlNotVaped, 2);
  assert.equal(vape.liquidSaved, 2);
  assert.equal(vape.accessoriesSaved, 2);
  assert.equal(vape.moneySaved, 4);
});

test("advanced spend supports roll-your-own and vaping histories", () => {
  const quitStart = new Date("2026-01-03T00:00:00");
  const ryo = estimateAdvancedSpend({ isAdvanced: true, smokingStartDate: "2025-12-27", mode: "ryo", weeklyRyoCost: 14 }, quitStart);
  assert.equal(ryo.moneySpent, 14);
  const vape = estimateAdvancedSpend({ isAdvanced: true, smokingStartDate: "2025-12-27", mode: "vaping", mlPerWeek: 7, costPer10ml: 10, accessoriesPerMonth: 30.4375 }, quitStart);
  assert.equal(vape.moneySpent, 14);
});

test("historical German pack estimates interpolate and stop at the last reference point", () => {
  assert.equal(estimateGermanPackPrice20At(new Date("1990-01-01T00:00:00")), 2.15);
  assert.equal(estimateGermanPackPrice20At(new Date("2026-01-01T00:00:00")), 9.4);
  assert.ok(estimateGermanPackPrice20At(new Date("2010-07-02T00:00:00")) > 5);
});

test("life-saved duration is formatted for minutes, hours, and days", () => {
  assert.equal(formatLifeSaved(42), "42m");
  assert.equal(formatLifeSaved(125), "2h 5m");
  assert.equal(formatLifeSaved(1500), "1d 1h");
});

test("still-using or incomplete quit state has zero tracked progress", () => {
  assert.equal(calculateProgress({ mode: "cigarettes", notStoppedYet: true }, fixedNow).elapsedMs, 0);
  assert.equal(calculateProgress({ mode: "cigarettes", quitDate: "" }, fixedNow).moneySaved, 0);
});
