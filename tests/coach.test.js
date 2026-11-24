import test from "node:test";
import assert from "node:assert/strict";
import { buildCoachPlan, buildNotificationPlan, coachSlots, COACH_WINDOW_DAYS } from "../app-core.js";

const fill = (key, vars = {}) => key.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ""));
const start = new Date("2026-03-02T00:00:00");
const cig = { mode: "cigarettes", quitDate: "2026-03-02", cigarettesPerDay: 20, cigarettesPerPack: 20, pricePerPack: 10 };

test("coach slots are densest in the first week and end after 12 weeks", () => {
  const slots = coachSlots();
  assert.equal(slots.filter((slot) => slot.day < 7).length, 14);
  assert.equal(slots.filter((slot) => slot.day >= 7 && slot.day < 14).length, 7);
  assert.equal(Math.max(...slots.map((slot) => slot.day)), 84);
  assert.ok(slots.every((slot, i) => i === 0 || slots[i - 1].day <= slot.day));
});

test("coach only schedules tips inside the rolling window", () => {
  const now = new Date("2026-03-02T08:00:00");
  const tips = buildCoachPlan(start, [], fill, now);
  const until = now.getTime() + COACH_WINDOW_DAYS * 86_400_000;
  assert.ok(tips.length > 0);
  assert.ok(tips.every((tip) => tip.at.getTime() <= until));
  assert.equal(tips[0].at.getTime(), new Date("2026-03-02T10:00:00").getTime());
  assert.equal(new Set(tips.map((tip) => tip.id)).size, tips.length);
});

test("coach tips use the if-then plan and rotate through it", () => {
  const plan = [{ trigger: "Coffee", action: "Walk for 5 minutes" }, { trigger: "Stress", action: "Breathe with SOS" }];
  const tips = buildCoachPlan(start, plan, fill, new Date("2026-03-01T00:00:00")).filter((tip) => tip.kind === "plan");
  assert.equal(tips[0].body, "Coffee? You know what to do: Walk for 5 minutes.");
  assert.equal(tips[1].body, "Stress? You know what to do: Breathe with SOS.");
  assert.equal(tips[2].body, "Coffee? You know what to do: Walk for 5 minutes.");
});

test("without a plan the coach suggests making one", () => {
  const tip = buildCoachPlan(start, [], fill, new Date("2026-03-01T00:00:00")).find((item) => item.kind === "plan");
  assert.equal(tip.title, "Make a plan");
});

test("plan rotation does not depend on when the app was opened", () => {
  const plan = [{ trigger: "A", action: "x" }, { trigger: "B", action: "y" }];
  const early = buildCoachPlan(start, plan, fill, new Date("2026-03-01T00:00:00"));
  const later = buildCoachPlan(start, plan, fill, new Date("2026-03-04T12:00:00"));
  const shared = later.find((tip) => tip.kind === "plan" && early.some((other) => other.id === tip.id));
  assert.equal(shared.body, early.find((tip) => tip.id === shared.id).body);
});

test("notification plan includes coach tips only when switched on", () => {
  const now = new Date("2026-03-02T08:00:00");
  const off = buildNotificationPlan(cig, { milestones: false, money: false }, now);
  const on = buildNotificationPlan(cig, { milestones: false, money: false, coach: true }, now);
  assert.deepEqual(off, []);
  assert.ok(on.length > 0);
  assert.ok(on.every((item) => item.id >= 6000 && item.id < 7000));
});

test("coach stays silent while still using", () => {
  assert.deepEqual(buildNotificationPlan({ ...cig, notStoppedYet: true }, { coach: true }), []);
});
