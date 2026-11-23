import test from "node:test";
import assert from "node:assert/strict";
import { boardThemeStatus, buildNotificationPlan, receiptColorStatus, weekSummary } from "../app-core.js";

const state = { mode: "cigarettes", quitDate: "2026-11-01", cigarettesPerDay: 20, cigarettesPerPack: 20, pricePerPack: 10 };
const off = { milestones: false, money: false };

test("evening check-in reminders skip days already checked in", () => {
  const now = new Date("2026-11-23T09:00:00"); // Monday
  const plan = buildNotificationPlan(state, { ...off, checkin: { enabled: true, doneKeys: ["2026-11-23"] } }, now);
  const checkins = plan.filter((item) => item.id >= 7000 && item.id < 7100);
  assert.equal(checkins.length, 13);
  assert.equal(checkins[0].at.getDate(), 24);
  assert.equal(checkins[0].at.getHours(), 20);
});

test("no check-in reminders unless switched on, and none after tonight passed", () => {
  const now = new Date("2026-11-23T21:00:00");
  assert.equal(buildNotificationPlan(state, off, now).length, 0);
  const plan = buildNotificationPlan(state, { ...off, checkin: { enabled: true } }, now);
  assert.equal(plan[0].at.getDate(), 24);
});

test("the week receipt arrives on Sunday evenings", () => {
  const now = new Date("2026-11-23T09:00:00"); // Monday
  const weekly = buildNotificationPlan(state, { ...off, weekly: true }, now);
  assert.equal(weekly.length, 2);
  assert.ok(weekly.every((item) => item.at.getDay() === 0 && item.at.getHours() === 19));
  assert.equal(weekly[0].at.getDate(), 29);
});

test("board colors unlock with smoke-free days", () => {
  assert.deepEqual(boardThemeStatus(0).unlocked, ["receipt", "amber"]);
  assert.equal(boardThemeStatus(0).next.theme, "blue");
  assert.deepEqual(boardThemeStatus(3).unlocked, ["receipt", "amber", "blue", "green"]);
  assert.equal(boardThemeStatus(7).next.day, 30);
  assert.equal(boardThemeStatus(400).next, null);
  assert.equal(boardThemeStatus(400).unlocked.length, boardThemeStatus(400).total);
});

test("weekSummary counts this week only", () => {
  const now = new Date("2026-11-25T12:00:00"); // Wednesday
  const at = (iso) => new Date(iso).getTime();
  const summary = weekSummary({
    checkins: { "2026-11-23": 1, "2026-11-24": 3, "2026-11-20": 2 },
    entries: [
      { kind: "craving", at: at("2026-11-24T10:00:00") },
      { kind: "craving", at: at("2026-11-25T08:00:00") },
      { kind: "slip", at: at("2026-11-23T22:00:00") },
      { kind: "craving", at: at("2026-11-21T10:00:00") },
    ],
    state,
  }, now);
  assert.equal(summary.checkinDays, 2);
  assert.equal(summary.strongDays, 1);
  assert.equal(summary.cravings, 2);
  assert.equal(summary.slips, 1);
  assert.equal(summary.freeDays, 2.5);
  assert.equal(summary.moneySaved, 25);
});

test("weekSummary counts money only from the quit day on", () => {
  const now = new Date("2026-11-25T12:00:00");
  const summary = weekSummary({ state: { ...state, quitDate: "2026-11-25" } }, now);
  assert.equal(summary.freeDays, 0.5);
  assert.equal(weekSummary({ state: { ...state, notStoppedYet: true } }, now).moneySaved, 0);
});

test("receipt colors: three to start with, the rest unlock with smoke-free days", () => {
  assert.equal(receiptColorStatus(0).unlocked, 3);
  assert.equal(receiptColorStatus(0).total, 8);
  assert.equal(receiptColorStatus(7).unlocked, 6);
  assert.equal(receiptColorStatus(400).unlocked, 8);
  assert.ok(receiptColorStatus(0).colors.every((c) => /^#[0-9a-f]{6}$/.test(c.hex)));
});
