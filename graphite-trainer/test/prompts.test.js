import test from "node:test";
import assert from "node:assert/strict";
import { graphiteToPhysical } from "../src/layout.js";
import { buildDrillPrompt, wordPrompts } from "../src/prompts.js";

test("builds deterministic drill prompts from provided keys", () => {
  assert.deepEqual(buildDrillPrompt(["b", "l"], 5), ["b", "l", "b", "l", "b"]);
});

test("word prompts only contain supported Graphite keys", () => {
  for (const word of wordPrompts) {
    for (const letter of word) {
      assert.notEqual(graphiteToPhysical(letter), null, `${letter} in ${word}`);
    }
  }
});
