import readline from "node:readline";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { graphiteToPhysical, physicalToGraphite, renderLayoutRows } from "./layout.js";
import { buildDrillPrompt, homeKeys, supportedWords } from "./prompts.js";
import {
  loadProgress,
  recordAttempt,
  recordCompletedSession,
  saveProgress,
} from "./progress.js";

const appDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const progressPath = path.join(appDir, ".graphite-trainer-progress.json");
const progress = loadProgress(progressPath);

let rawModeEnabled = false;
let activeHandler = null;

function clear() {
  process.stdout.write("\x1Bc");
}

function write(lines = []) {
  process.stdout.write(`${lines.join("\n")}\n`);
}

function enableRawMode() {
  if (!process.stdin.isTTY) {
    throw new Error("Graphite Trainer needs an interactive terminal.");
  }

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  rawModeEnabled = true;
}

function disableRawMode() {
  if (rawModeEnabled && process.stdin.isTTY) {
    process.stdin.setRawMode(false);
    rawModeEnabled = false;
  }
}

function accuracy() {
  if (progress.totalAttempts === 0) {
    return "0.0";
  }

  return ((progress.correctAttempts / progress.totalAttempts) * 100).toFixed(1);
}

function showMenu() {
  setHandler(handleMenuKey);
  clear();
  write([
    "Graphite Trainer",
    "",
    "1 map",
    "2 drill",
    "3 words",
    "4 ghost",
    "5 stats",
    "q quit",
    "",
    `Accuracy ${accuracy()}% | Best streak ${progress.bestStreak} | Sessions ${progress.completedSessions}`,
    "",
    "Choose mode.",
  ]);
}

function showMap() {
  clear();
  write([
    "Map mode",
    "",
    ...renderLayoutRows(),
    "",
    "Read each pair as physical->Graphite.",
    "Press any key for menu.",
  ]);
}

function showStats() {
  const missedKeys = Object.entries(progress.keys)
    .filter(([, value]) => value.misses > 0)
    .sort((left, right) => right[1].misses - left[1].misses)
    .slice(0, 5)
    .map(([key, value]) => `${key}: ${value.misses} misses / ${value.attempts} attempts`);

  clear();
  write([
    "Stats",
    "",
    `Attempts: ${progress.totalAttempts}`,
    `Correct: ${progress.correctAttempts}`,
    `Accuracy: ${accuracy()}%`,
    `Completed sessions: ${progress.completedSessions}`,
    `Best streak: ${progress.bestStreak}`,
    "",
    "Most missed:",
    ...(missedKeys.length > 0 ? missedKeys : ["none yet"]),
    "",
    "Press any key for menu.",
  ]);
}

function setHandler(handler) {
  activeHandler = handler;
}

function renderPractice(title, prompt, index, message) {
  const expectedGraphite = prompt[index];
  const expectedPhysical = graphiteToPhysical(expectedGraphite);
  const instruction =
    expectedGraphite === " "
      ? "Press Space between words."
      : `Press physical ${expectedPhysical} for Graphite ${expectedGraphite}.`;
  const done = prompt.slice(0, index).join("");
  const todo = prompt.slice(index).join("");
  const visibleExpected = expectedGraphite === " " ? "space" : expectedGraphite;

  clear();
  write([
    title,
    "",
    `${done}[${visibleExpected}]${todo.slice(1)}`,
    "",
    instruction,
    `Streak ${progress.currentStreak} | Accuracy ${accuracy()}%`,
    message,
    "",
    "Esc returns to menu. Ctrl+C quits.",
  ]);
}

function practiceSession(title, prompt) {
  let index = 0;
  let message = "";

  renderPractice(title, prompt, index, message);

  const onKeypress = (input, key) => {
    if (key.ctrl && key.name === "c") {
      quit();
      return;
    }

    if (key.name === "escape" || input === "\u001b") {
      recordCompletedSession(progress);
      saveProgress(progressPath, progress);
      showMenu();
      return;
    }

    const expectedGraphite = prompt[index];

    if (expectedGraphite === " " && key.name === "space") {
      message = "Space.";
      index += 1;
    } else if (!input) {
      message = "Ignored unsupported key.";
      renderPractice(title, prompt, index, message);
      return;
    } else {
      const physicalKey = input.toLowerCase();
      const graphiteKey = physicalToGraphite(physicalKey);

      if (graphiteKey === null) {
        message = `Ignored unsupported key ${input}.`;
        renderPractice(title, prompt, index, message);
        return;
      }

      recordAttempt(progress, physicalKey, graphiteKey, expectedGraphite);

      if (graphiteKey === expectedGraphite) {
        message = `Correct: ${physicalKey} -> ${graphiteKey}.`;
        index += 1;
      } else {
        const expectedPhysical = graphiteToPhysical(expectedGraphite);
        message = `Miss: ${physicalKey} -> ${graphiteKey}. Expected physical ${expectedPhysical}.`;
      }
    }

    if (index >= prompt.length) {
      recordCompletedSession(progress);
      saveProgress(progressPath, progress);
      clear();
      write([
        `${title} complete`,
        "",
        `Accuracy ${accuracy()}% | Best streak ${progress.bestStreak}`,
        "",
        "Press any key for menu.",
      ]);
      setHandler(showMenu);
      return;
    }

    renderPractice(title, prompt, index, message);
  };

  setHandler(onKeypress);
}

function ghostSession() {
  let output = "";
  let message = "";

  const render = () => {
    clear();
    write([
      "Ghost mode",
      "",
      "Type current physical keys. Graphite output appears below.",
      "",
      output || "(empty)",
      "",
      message,
      "",
      "Backspace deletes. Esc returns to menu. Ctrl+C quits.",
    ]);
  };

  render();

  const onKeypress = (input, key) => {
    if (key.ctrl && key.name === "c") {
      quit();
      return;
    }

    if (key.name === "escape" || input === "\u001b") {
      saveProgress(progressPath, progress);
      showMenu();
      return;
    }

    if (key.name === "backspace") {
      output = output.slice(0, -1);
      message = "";
      render();
      return;
    }

    if (key.name === "space") {
      output += " ";
      message = "";
      render();
      return;
    }

    if (!input) {
      message = "Ignored unsupported key.";
      render();
      return;
    }

    const physicalKey = input.toLowerCase();
    const graphiteKey = physicalToGraphite(physicalKey);

    if (graphiteKey === null) {
      message = `Ignored unsupported key ${input}.`;
      render();
      return;
    }

    output += graphiteKey;
    message = `${physicalKey} -> ${graphiteKey}`;
    recordAttempt(progress, physicalKey, graphiteKey, graphiteKey);
    render();
  };

  setHandler(onKeypress);
}

function startWords() {
  const words = supportedWords();
  const prompt = words.join(" ").split("");
  practiceSession("Words mode", prompt);
}

function startDrill() {
  practiceSession("Drill mode", buildDrillPrompt(homeKeys, 30));
}

function quit() {
  saveProgress(progressPath, progress);
  disableRawMode();
  process.stdout.write("\n");
  process.exit(0);
}

function start() {
  try {
    enableRawMode();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  process.stdin.resume();
  showMenu();

  process.stdin.on("keypress", (input, key) => {
    activeHandler?.(input, key);
  });
}

function handleMenuKey(_input, key) {
  if (key.ctrl && key.name === "c") {
    quit();
    return;
  }

  if (key.name === "q") {
    quit();
    return;
  }

  if (key.name === "1") {
    showMap();
    setHandler(showMenu);
    return;
  }

  if (key.name === "2") {
    startDrill();
    return;
  }

  if (key.name === "3") {
    startWords();
    return;
  }

  if (key.name === "4") {
    ghostSession();
    return;
  }

  if (key.name === "5") {
    showStats();
    setHandler(showMenu);
  }
}

process.on("exit", disableRawMode);
start();
