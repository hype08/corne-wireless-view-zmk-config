import { graphiteToPhysical } from "./layout.js";

export const homeKeys = ["n", "r", "t", "s", "g", "y", "h", "a", "e", "i"];

export const wordPrompts = [
  "that",
  "this",
  "near",
  "site",
  "tone",
  "rate",
  "raise",
  "train",
  "heart",
  "graphite",
];

export function buildDrillPrompt(keys = homeKeys, length = 20) {
  if (!Array.isArray(keys) || keys.length === 0) {
    return [];
  }

  return Array.from({ length }, (_, index) => keys[index % keys.length]);
}

export function supportedWords() {
  return wordPrompts.filter((word) =>
    [...word].every((letter) => graphiteToPhysical(letter) !== null),
  );
}
