import test from "node:test";
import assert from "node:assert/strict";
import { dayPart, diaryStats, normalizeDiary, DIARY_NOTE_MAX } from "../app-core.js";

const triggers = ["coffee", "stress", "other"];
const at = (iso) => new Date(iso).getTime();

test("normalizeDiary keeps valid entries, newest first", () => {
  const diary = normalizeDiary({
    entries: [
      { id: "a", at: at("2026-11-20T09:00:00"), kind: "craving", strength: 3, trigger: "coffee", note: " hi " },
      { id: "b", at: at("2026-11-21T20:00:00"), kind: "slip", strength: 9, trigger: "party", note: 5 },
      { id: "c", at: "nope", kind: "craving" },
      { id: "d", at: at("2026-11-21T08:00:00"), kind: "relapse" },
      null,
    ],
  }, triggers);
  assert.deepEqual(diary.entries.map((entry) => entry.id), ["b", "a"]);
  assert.deepEqual(diary.entries[0], { id: "b", at: at("2026-11-21T20:00:00"), kind: "slip", strength: null, trigger: null, note: "" });
  assert.equal(diary.entries[1].note, "hi");
});

test("normalizeDiary handles missing data and caps long notes", () => {
  assert.deepEqual(normalizeDiary(null, triggers), { entries: [] });
  const long = normalizeDiary({ entries: [{ at: 1, kind: "craving", note: "x".repeat(200) }] }, triggers);
  assert.equal(long.entries[0].note.length, DIARY_NOTE_MAX);
  assert.equal(long.entries[0].id, "1");
});

test("dayPart splits the day into four parts", () => {
  assert.equal(dayPart(new Date("2026-11-22T06:00:00")), "morning");
  assert.equal(dayPart(new Date("2026-11-22T13:00:00")), "afternoon");
  assert.equal(dayPart(new Date("2026-11-22T19:00:00")), "evening");
  assert.equal(dayPart(new Date("2026-11-22T23:30:00")), "night");
  assert.equal(dayPart(new Date("2026-11-22T03:00:00")), "night");
});

test("diaryStats counts kinds, the last week, top triggers and the usual time", () => {
  const now = new Date("2026-11-22T12:00:00");
  const entries = normalizeDiary({
    entries: [
      { at: at("2026-11-22T19:00:00"), kind: "craving", trigger: "coffee" },
      { at: at("2026-11-21T20:00:00"), kind: "craving", trigger: "coffee" },
      { at: at("2026-11-20T18:00:00"), kind: "slip", trigger: "stress" },
      { at: at("2026-11-01T08:00:00"), kind: "craving", trigger: "stress" },
      { at: at("2026-11-01T09:00:00"), kind: "craving" },
    ],
  }, triggers).entries;
  const stats = diaryStats(entries, now);
  assert.equal(stats.cravings, 4);
  assert.equal(stats.slips, 1);
  assert.equal(stats.weekCravings, 2);
  assert.equal(stats.weekSlips, 1);
  assert.deepEqual(stats.topTriggers, [{ trigger: "coffee", count: 2 }, { trigger: "stress", count: 2 }]);
  assert.equal(stats.dayPart, "evening");
});

test("diaryStats waits for a few entries before naming a usual time", () => {
  const entries = normalizeDiary({ entries: [{ at: at("2026-11-22T19:00:00"), kind: "craving" }] }, triggers).entries;
  assert.equal(diaryStats(entries).dayPart, null);
  assert.deepEqual(diaryStats([]).topTriggers, []);
});
