import test from "node:test";
import assert from "node:assert/strict";
import { normalizePlan, PLAN_MAX_ITEMS } from "../app-core.js";

const triggers = ["coffee", "meal", "stress", "bored"];
const actions = ["walk", "water", "breathe"];

test("normalizePlan returns an empty plan for missing or broken data", () => {
  assert.deepEqual(normalizePlan(null, triggers, actions), { items: [] });
  assert.deepEqual(normalizePlan({ items: "nope" }, triggers, actions), { items: [] });
  assert.deepEqual(normalizePlan({ items: [null, 3] }, triggers, actions), { items: [] });
});

test("normalizePlan drops unknown ids and duplicate triggers", () => {
  const plan = normalizePlan({
    items: [
      { trigger: "coffee", action: "water" },
      { trigger: "coffee", action: "walk" },
      { trigger: "party", action: "walk" },
      { trigger: "meal", action: "dance" },
      { trigger: "stress", action: "breathe", extra: true },
    ],
  }, triggers, actions);
  assert.deepEqual(plan.items, [
    { trigger: "coffee", action: "water" },
    { trigger: "stress", action: "breathe" },
  ]);
});

test("normalizePlan keeps at most PLAN_MAX_ITEMS entries", () => {
  const items = triggers.map((trigger) => ({ trigger, action: "walk" }));
  const plan = normalizePlan({ items }, triggers, actions);
  assert.equal(plan.items.length, PLAN_MAX_ITEMS);
  assert.deepEqual(plan.items.map((item) => item.trigger), triggers.slice(0, PLAN_MAX_ITEMS));
});
