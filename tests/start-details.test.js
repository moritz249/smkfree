import test from "node:test";
import assert from "node:assert/strict";
import { moneyForecast, timeGrid, timeTotals } from "../app-core.js";

test("timeTotals counts whole weeks, days, hours, minutes and seconds", () => {
  const ms = ((3 * 24 + 5) * 60 + 7) * 60_000 + 42_000; // 3 d 5 h 7 min 42 s
  assert.deepEqual(timeTotals(ms), { weeks: 0, days: 3, hours: 77, minutes: 4627, seconds: 277_662 });
  assert.deepEqual(timeTotals(-5), { weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
});

test("timeGrid shows months up to the next full year, then years", () => {
  const start = new Date("2025-06-03T00:00:00");
  const grid = timeGrid(start, new Date("2026-11-18T00:00:00"));
  assert.equal(grid.unit, "month");
  assert.equal(grid.done, 17);
  assert.equal(grid.total, 24);
  assert.ok(grid.partial > 0.4 && grid.partial < 0.6);

  const early = timeGrid(start, new Date("2025-06-10T00:00:00"));
  assert.equal(early.done, 0);
  assert.equal(early.total, 12);

  const late = timeGrid(new Date("2016-01-01T00:00:00"), new Date("2026-07-01T00:00:00"));
  assert.equal(late.unit, "year");
  assert.equal(late.done, 10);
  assert.equal(late.total, 15);
});

test("moneyForecast gives the date a goal is reached at the current daily saving", () => {
  const now = new Date("2026-01-01T00:00:00");
  const f = moneyForecast({ saved: 100, target: 200, perDay: 10, now });
  assert.equal(f.ratio, 0.5);
  assert.equal(f.left, 100);
  assert.equal(f.days, 10);
  assert.equal(f.date.toISOString(), new Date("2026-01-11T00:00:00").toISOString());

  assert.equal(moneyForecast({ saved: 50, target: 200, perDay: 0, now }).date, null);
  const done = moneyForecast({ saved: 300, target: 200, perDay: 5, now });
  assert.equal(done.ratio, 1);
  assert.equal(done.left, 0);
});
