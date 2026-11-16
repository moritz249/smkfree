import test from "node:test";
import assert from "node:assert/strict";
import {
  asciiBar,
  buildNotificationPlan,
  dailySaving,
  dateForSavings,
  goalProgress,
} from "../app-core.js";

const cig = { mode: "cigarettes", quitDate: "2026-01-01", cigarettesPerDay: 20, cigarettesPerPack: 20, pricePerPack: 10 };

test("dailySaving covers all three modes", () => {
  assert.equal(dailySaving(cig), 10);
  assert.equal(dailySaving({ mode: "ryo", weeklyRyoCost: 21 }), 3);
  assert.ok(Math.abs(dailySaving({ mode: "vaping", mlPerWeek: 70, costPer10ml: 10, accessoriesPerMonth: 30.4375 }) - 11) < 1e-9);
  assert.equal(dailySaving({ mode: "cigarettes", cigarettesPerDay: 10, cigarettesPerPack: 0, pricePerPack: 8 }), 0);
});

test("dateForSavings returns the moment a sum is reached", () => {
  assert.equal(dateForSavings(cig, 100).getTime(), new Date("2026-01-11T00:00:00").getTime());
  assert.equal(dateForSavings({ ...cig, notStoppedYet: true }, 100), null);
});

test("goalProgress reports ratio and reached state", () => {
  const goal = { name: "Headphones", price: 200 };
  const halfway = goalProgress(cig, goal, new Date("2026-01-11T00:00:00"));
  assert.equal(halfway.ratio, 0.5);
  assert.equal(halfway.reached, false);
  const done = goalProgress(cig, goal, new Date("2026-02-01T00:00:00"));
  assert.equal(done.reached, true);
  assert.equal(done.saved, 200);
  assert.equal(goalProgress(cig, { name: "", price: 10 }), null);
});

test("asciiBar renders a fixed-width bar", () => {
  assert.equal(asciiBar(0.5, 10), "[#####.....]");
  assert.equal(asciiBar(2, 4), "[####]");
  assert.equal(asciiBar(-1, 4), "[....]");
});

test("notification plan only contains future events, sorted, capped and with unique ids", () => {
  const now = new Date("2026-01-05T12:00:00");
  const plan = buildNotificationPlan(cig, {
    goal: { name: "Bike", price: 500 },
    daily: { enabled: true, hour: 9, minute: 0 },
    healthMilestones: [{ hours: 24, title: "Nicotine clears", detail: "x" }, { hours: 720, title: "Breathing", detail: "y" }],
  }, now);

  assert.ok(plan.length > 0 && plan.length <= 60);
  assert.ok(plan.every((item) => item.at > now));
  assert.ok(plan.every((item, i) => i === 0 || plan[i - 1].at <= item.at));
  assert.equal(new Set(plan.map((item) => item.id)).size, plan.length);
  assert.ok(plan.some((item) => item.title === "PAID: Bike"));
  assert.ok(!plan.some((item) => item.title === "Nicotine clears"), "past milestone must be skipped");
});

test("notification plan is empty while still using and respects toggles", () => {
  assert.deepEqual(buildNotificationPlan({ ...cig, notStoppedYet: true }), []);
  const plan = buildNotificationPlan(cig, { milestones: false, money: false }, new Date("2026-01-05T12:00:00"));
  assert.deepEqual(plan, []);
});
