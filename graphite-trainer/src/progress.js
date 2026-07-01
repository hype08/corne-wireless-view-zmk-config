import fs from "node:fs";
import path from "node:path";

export function createEmptyProgress() {
  return {
    totalAttempts: 0,
    correctAttempts: 0,
    completedSessions: 0,
    bestStreak: 0,
    currentStreak: 0,
    keys: {},
  };
}

export function recordAttempt(progress, physicalKey, graphiteKey, expectedGraphite) {
  const keyStats = progress.keys[physicalKey] ?? { attempts: 0, misses: 0 };
  const isCorrect = graphiteKey === expectedGraphite;

  keyStats.attempts += 1;
  if (!isCorrect) {
    keyStats.misses += 1;
  }

  progress.keys[physicalKey] = keyStats;
  progress.totalAttempts += 1;

  if (isCorrect) {
    progress.correctAttempts += 1;
    progress.currentStreak += 1;
    progress.bestStreak = Math.max(progress.bestStreak, progress.currentStreak);
  } else {
    progress.currentStreak = 0;
  }

  return progress;
}

export function recordCompletedSession(progress) {
  progress.completedSessions += 1;
  progress.currentStreak = 0;
  return progress;
}

export function loadProgress(filePath) {
  if (!fs.existsSync(filePath)) {
    return createEmptyProgress();
  }

  try {
    return { ...createEmptyProgress(), ...JSON.parse(fs.readFileSync(filePath, "utf8")) };
  } catch {
    fs.renameSync(filePath, `${filePath}.invalid`);
    return createEmptyProgress();
  }
}

export function saveProgress(filePath, progress) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(progress, null, 2)}\n`, "utf8");
}
