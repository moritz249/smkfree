import test from "node:test";
import assert from "node:assert/strict";
import { checkinWeek, dailyTip, dateKey, normalizeCheckins } from "../app-core.js";

const tr = (text, vars = {}) => text.replace(/\{(\w+)\}/g, (_, key) => String(vars[key]));

test("normalizeCheckins keeps valid days and levels only", () => {
  assert.deepEqual(normalizeCheckins(null), {});
  assert.deepEqual(normalizeCheckins([1, 2]), {});
  assert.deepEqual(
    normalizeCheckins({ "2026-11-23": 2, "2026-11-22": 7, nope: 1, "2026-11-21": 1.5, "2026-11-20": 0 }),
    { "2026-11-23": 2, "2026-11-20": 0 },
  );
});

test("checkinWeek runs Monday to Sunday and marks today and the future", () => {
  // Sunday 22 Nov 2026: the week started on Monday 16 Nov.
  const week = checkinWeek({ "2026-11-16": 1, "2026-11-22": 3 }, new Date("2026-11-22T09:00:00"));
  assert.equal(week.length, 7);
  assert.equal(week[0].key, "2026-11-16");
  assert.equal(week[0].level, 1);
  assert.equal(week[1].level, null);
  assert.equal(week[6].isToday, true);
  assert.equal(week[6].level, 3);
  assert.equal(week.some((day) => day.isFuture), false);

  // Wednesday 18 Nov 2026
  const midweek = checkinWeek({}, new Date("2026-11-18T09:00:00"));
  assert.equal(midweek[2].isToday, true);
  assert.equal(midweek[3].isFuture, true);
});

test("dateKey uses the local calendar day", () => {
  assert.equal(dateKey(new Date(2026, 0, 5, 23, 30)), "2026-01-05");
});

test("dailyTip is the same all day and uses the personal plan", () => {
  const plan = [{ trigger: "Coffee", action: "drink water" }];
  assert.deepEqual(dailyTip(3, plan, tr), dailyTip(3, plan, tr));
  const tips = Array.from({ length: 30 }, (_, day) => dailyTip(day, plan, tr));
  assert.ok(tips.some((tip) => tip.body.includes("Coffee")));
  assert.ok(tips.every((tip) => tip.title && tip.body));
  assert.equal(dailyTip(-4, [], tr).kind, dailyTip(0, [], tr).kind);
});
