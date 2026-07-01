import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  createEmptyProgress,
  loadProgress,
  recordAttempt,
  saveProgress,
} from "../src/progress.js";

test("creates empty progress", () => {
  assert.deepEqual(createEmptyProgress(), {
    totalAttempts: 0,
    correctAttempts: 0,
    completedSessions: 0,
    bestStreak: 0,
    currentStreak: 0,
    keys: {},
  });
});

test("records correct attempts", () => {
  const progress = createEmptyProgress();

  recordAttempt(progress, "q", "b", "b");

  assert.equal(progress.totalAttempts, 1);
  assert.equal(progress.correctAttempts, 1);
  assert.equal(progress.currentStreak, 1);
  assert.equal(progress.bestStreak, 1);
  assert.deepEqual(progress.keys.q, { attempts: 1, misses: 0 });
});

test("records misses and resets current streak", () => {
  const progress = createEmptyProgress();

  recordAttempt(progress, "w", "l", "b");

  assert.equal(progress.totalAttempts, 1);
  assert.equal(progress.correctAttempts, 0);
  assert.equal(progress.currentStreak, 0);
  assert.equal(progress.bestStreak, 0);
  assert.deepEqual(progress.keys.w, { attempts: 1, misses: 1 });
});

test("saves and loads progress", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "graphite-progress-"));
  const filePath = path.join(dir, "progress.json");
  const progress = createEmptyProgress();
  recordAttempt(progress, "q", "b", "b");

  saveProgress(filePath, progress);

  assert.deepEqual(loadProgress(filePath), progress);
});

test("backs up invalid JSON and starts fresh", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "graphite-progress-"));
  const filePath = path.join(dir, "progress.json");
  fs.writeFileSync(filePath, "{bad json", "utf8");

  assert.deepEqual(loadProgress(filePath), createEmptyProgress());
  assert.equal(fs.existsSync(`${filePath}.invalid`), true);
});
