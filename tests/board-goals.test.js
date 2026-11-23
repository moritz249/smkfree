import test from "node:test";
import assert from "node:assert/strict";
import { boardGoals, calculateProgress, stepProgress } from "../app-core.js";

const now = new Date("2026-11-23T12:00:00");
const cigarettes = { mode: "cigarettes", quitDate: "2026-11-23", cigarettesPerDay: 20, cigarettesPerPack: 20, pricePerPack: 8 };

test("stepProgress measures from the previous step to the next", () => {
  assert.deepEqual(stepProgress(5, [1, 3, 7]), { from: 3, target: 7, ratio: 0.5, left: 2, done: false });
  assert.equal(stepProgress(0.5, [1, 3]).from, 0);
  assert.equal(stepProgress(0.5, [1, 3]).ratio, 0.5);
  assert.equal(stepProgress(99, [1, 3]).done, true);
});

test("boardGoals: first day aims at day 1, money at the next threshold, life at one day", () => {
  const goals = boardGoals(cigarettes, calculateProgress(cigarettes, now));
  assert.equal(goals.time.target, 1);
  assert.equal(goals.time.hoursLeft, 12);
  assert.equal(goals.money.target, 10); // 4 € saved after 12 hours
  assert.equal(goals.money.name, null);
  assert.equal(goals.third.target, 1); // 10 cigarettes x 20 min = 200 min of 1 day
});

test("boardGoals uses the savings goal while it is not reached", () => {
  const progress = calculateProgress(cigarettes, now);
  const goals = boardGoals(cigarettes, progress, { name: "Concert", price: 40 });
  assert.equal(goals.money.name, "Concert");
  assert.equal(goals.money.ratio, 0.1);
  assert.equal(boardGoals(cigarettes, progress, { name: "Coffee", price: 3 }).money.name, null);
});

test("boardGoals stays at zero before the quit day", () => {
  const waiting = { ...cigarettes, notStoppedYet: true };
  const goals = boardGoals(waiting, calculateProgress(waiting, now));
  assert.equal(goals.started, false);
  assert.equal(goals.time.ratio, 0);
  assert.equal(goals.money.ratio, 0);
});

test("stepProgress keeps going in even steps past the last one", () => {
  assert.deepEqual(stepProgress(12, [1, 3, 7], 5), { from: 12, target: 17, ratio: 0, left: 5, done: false });
  assert.equal(stepProgress(14.5, [1, 3, 7], 5).ratio, 0.5);
});

test("boardGoals never ends: after ten years the next goal is the next year", () => {
  const longAgo = { ...cigarettes, quitDate: "2010-01-01" };
  const goals = boardGoals(longAgo, calculateProgress(longAgo, now));
  assert.equal(goals.time.done, false);
  assert.ok(goals.time.target > goals.time.from);
  assert.equal(goals.time.target - goals.time.from, 365.25);
  assert.ok(Math.abs(goals.time.target / 365.25 - Math.round(goals.time.target / 365.25)) < 0.01);
});
