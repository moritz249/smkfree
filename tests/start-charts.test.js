import test from "node:test";
import assert from "node:assert/strict";
import { checkinHistory, cravingPattern } from "../app-core.js";

test("checkinHistory week runs Monday to Sunday with levels, counts and average", () => {
  const now = new Date("2026-11-26T12:00:00"); // Thursday
  const checkins = { "2026-11-23": 0, "2026-11-24": 3, "2026-11-26": 2, "2026-11-20": 1 };
  const week = checkinHistory(checkins, "week", now);
  assert.equal(week.days.length, 7);
  assert.equal(week.days[0].key, "2026-11-23");
  assert.deepEqual(week.days.map((day) => day.level), [0, 3, null, 2, null, null, null]);
  assert.equal(week.days[3].isToday, true);
  assert.equal(week.days[4].isFuture, true);
  assert.deepEqual(week.counts, [1, 0, 1, 1]);
  assert.equal(week.recorded, 3);
  assert.ok(Math.abs(week.average - 5 / 3) < 1e-9);
});

test("checkinHistory month covers the last 30 days up to today", () => {
  const now = new Date("2026-11-26T08:00:00");
  const month = checkinHistory({ "2026-10-28": 1, "2026-10-27": 3, "2026-11-26": 0 }, "month", now);
  assert.equal(month.days.length, 30);
  assert.equal(month.days[0].key, "2026-10-28");
  assert.equal(month.days[29].key, "2026-11-26");
  assert.equal(month.recorded, 2);
  assert.equal(checkinHistory({}, "month", now).average, null);
});

test("cravingPattern counts parts of the day and top triggers in the last 30 days", () => {
  const now = new Date("2026-11-26T23:00:00");
  const at = (s) => new Date(s).getTime();
  const entries = [
    { at: at("2026-11-26T08:00:00"), kind: "craving", trigger: "coffee" },
    { at: at("2026-11-25T09:30:00"), kind: "craving", trigger: "coffee" },
    { at: at("2026-11-24T19:00:00"), kind: "slip", trigger: "alcohol" },
    { at: at("2026-11-20T02:00:00"), kind: "craving", trigger: null },
    { at: at("2026-09-01T08:00:00"), kind: "craving", trigger: "stress" },
  ];
  const pattern = cravingPattern(entries, now);
  assert.equal(pattern.total, 4);
  assert.deepEqual(pattern.parts, { morning: 2, afternoon: 0, evening: 1, night: 1 });
  assert.equal(pattern.topPart, "morning");
  assert.deepEqual(pattern.triggers, [{ trigger: "coffee", count: 2 }, { trigger: "alcohol", count: 1 }]);
  assert.equal(cravingPattern([], now).topPart, null);
});
