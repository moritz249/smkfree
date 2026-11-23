import test from "node:test";
import assert from "node:assert/strict";
import { recoveryProgress } from "../app-core.js";

const milestones = [
  { hours: 1 / 3, label: "Pulse" },
  { hours: 12, label: "Oxygen" },
  { hours: 2016, label: "Lungs" },
];

test("recoveryProgress gives a percent per milestone and counts the reached ones", () => {
  const result = recoveryProgress(milestones, 6);
  assert.deepEqual(result.items.map((i) => i.percent), [100, 50, 0]);
  assert.equal(result.reached, 1);
  assert.equal(result.total, 3);
  assert.equal(result.next.label, "Oxygen");
  assert.equal(result.next.hoursLeft, 6);
});

test("recoveryProgress never shows 100 % before a milestone is reached", () => {
  const result = recoveryProgress(milestones, 11.99);
  assert.equal(result.items[1].percent, 99);
  assert.equal(result.items[1].done, false);
});

test("recoveryProgress handles not quit yet and finished lists", () => {
  assert.deepEqual(recoveryProgress(milestones, -5).items.map((i) => i.percent), [0, 0, 0]);
  const all = recoveryProgress(milestones, 5000);
  assert.equal(all.reached, 3);
  assert.equal(all.next, null);
});
