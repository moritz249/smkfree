import test from "node:test";
import assert from "node:assert/strict";
import { boardData, calculateProgress, splitMinutes } from "../app-core.js";

const now = new Date("2026-11-23T12:00:00");
const cigarettes = { mode: "cigarettes", quitDate: "2026-10-24", cigarettesPerDay: 15, cigarettesPerPack: 20, pricePerPack: 10 };

test("splitMinutes breaks minutes into days, hours and minutes", () => {
  assert.deepEqual(splitMinutes(1440 * 2 + 125), { days: 2, hours: 2, minutes: 5 });
  assert.deepEqual(splitMinutes(-3), { days: 0, hours: 0, minutes: 0 });
});

test("boardData shows days, money and life back for cigarettes", () => {
  const data = boardData(cigarettes, calculateProgress(cigarettes, now));
  assert.equal(data.started, true);
  assert.equal(data.days, 30);
  assert.equal(data.months, 0);
  assert.equal(data.restDays, 30);
  assert.equal(Math.round(data.money), 229);
  assert.equal(data.third.kind, "life");
  // 30.5 days * 15 cigarettes * 20 minutes
  assert.equal(data.third.days, 6);
});

test("boardData uses rolls and ml instead of life time for roll-ups and vaping", () => {
  const ryo = { mode: "ryo", quitDate: "2026-11-16", rollsPerDay: 10, weeklyRyoCost: 25 };
  assert.equal(boardData(ryo, calculateProgress(ryo, now)).third.kind, "rolls");
  const vape = { mode: "vaping", quitDate: "2026-11-16", mlPerWeek: 30, costPer10ml: 8, accessoriesPerMonth: 15 };
  const data = boardData(vape, calculateProgress(vape, now));
  assert.equal(data.third.kind, "ml");
  assert.equal(data.third.value, 32);
});

test("boardData shows zeros before the quit day", () => {
  const waiting = { ...cigarettes, notStoppedYet: true };
  const data = boardData(waiting, calculateProgress(waiting, now));
  assert.equal(data.started, false);
  assert.equal(data.days, 0);
  assert.equal(data.money, 0);
});
