# Graphite CLI Trainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a terminal Graphite trainer that lets the user practice Graphite from their current Corne physical keys without changing firmware.

**Architecture:** A dependency-free Node.js CLI owns the interaction loop. Small modules split layout mapping, prompt generation, and progress persistence so each piece is testable.

**Tech Stack:** Node.js ESM, `node:test`, terminal raw input via `readline`.

## Global Constraints

- Do not edit `config/corne.keymap`.
- Do not remap the OS keyboard.
- Do not require firmware flashing.
- Run from `graphite-trainer` with `npm start`.
- Save stats to `graphite-trainer/.graphite-trainer-progress.json`.
- Validate with `cd graphite-trainer && npm test`.

---

## File Structure

- Create `graphite-trainer/package.json`: package metadata and `start` / `test` scripts.
- Create `graphite-trainer/src/layout.js`: Corne physical layout, Graphite layout, translation helpers.
- Create `graphite-trainer/src/progress.js`: load, save, and update progress state.
- Create `graphite-trainer/src/prompts.js`: deterministic drill and word prompts.
- Create `graphite-trainer/src/app.js`: menu, render functions, raw key sessions.
- Create `graphite-trainer/test/layout.test.js`: mapping tests.
- Create `graphite-trainer/test/progress.test.js`: progress tests.
- Create `graphite-trainer/test/prompts.test.js`: prompt tests.

## Task 1: Package and Layout Core

**Files:**
- Create: `graphite-trainer/package.json`
- Create: `graphite-trainer/src/layout.js`
- Test: `graphite-trainer/test/layout.test.js`

**Interfaces:**
- Produces: `PHYSICAL_ROWS: string[][]`, `GRAPHITE_ROWS: string[][]`, `physicalToGraphite(key: string): string | null`, `graphiteToPhysical(letter: string): string | null`, `renderLayoutRows(): string[]`

- [ ] **Step 1: Write failing mapping tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  graphiteToPhysical,
  physicalToGraphite,
  renderLayoutRows,
} from "../src/layout.js";

test("translates current physical keys to Graphite output", () => {
  assert.equal(physicalToGraphite("q"), "b");
  assert.equal(physicalToGraphite("w"), "l");
  assert.equal(physicalToGraphite("f"), "d");
  assert.equal(physicalToGraphite("p"), "w");
  assert.equal(physicalToGraphite("m"), "y");
  assert.equal(physicalToGraphite("e"), "a");
});

test("finds physical key for Graphite letters", () => {
  assert.equal(graphiteToPhysical("b"), "q");
  assert.equal(graphiteToPhysical("l"), "w");
  assert.equal(graphiteToPhysical("d"), "f");
  assert.equal(graphiteToPhysical("y"), "m");
});

test("renders physical to Graphite rows for map mode", () => {
  assert.deepEqual(renderLayoutRows(), [
    "q->b  w->l  f->d  p->w  b->z      j->f  l->o  u->u  y->j  ;->;",
    "a->n  r->r  s->t  t->s  g->g      m->y  n->h  e->a  i->e  o->i",
    "z->q  x->x  c->m  d->c  v->v      k->k  h->p  ,->,  .->.  /->/",
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd graphite-trainer && npm test`

Expected: FAIL because package and source files do not exist.

- [ ] **Step 3: Implement package and layout module**

Create `package.json` with scripts:

```json
{
  "name": "graphite-trainer",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "start": "node src/app.js",
    "test": "node --test"
  }
}
```

Create `src/layout.js` with the tested constants and functions.

- [ ] **Step 4: Run mapping tests**

Run: `cd graphite-trainer && npm test`

Expected: PASS for layout tests.

## Task 2: Prompt and Progress Modules

**Files:**
- Create: `graphite-trainer/src/prompts.js`
- Create: `graphite-trainer/src/progress.js`
- Test: `graphite-trainer/test/prompts.test.js`
- Test: `graphite-trainer/test/progress.test.js`

**Interfaces:**
- Consumes: `graphiteToPhysical(letter: string): string | null`
- Produces: `buildDrillPrompt(keys: string[], length: number): string[]`, `wordPrompts: string[]`, `createEmptyProgress(): object`, `recordAttempt(progress, physicalKey, graphiteKey, expectedGraphite): object`, `loadProgress(filePath): object`, `saveProgress(filePath, progress): void`

- [ ] **Step 1: Write prompt tests**

Test that `buildDrillPrompt(["b", "l"], 5)` returns five entries limited to `b` and `l`, and that each `wordPrompts` character can map back to a physical key.

- [ ] **Step 2: Write progress tests**

Test fresh progress, correct attempt update, miss update, save/load, and invalid JSON backup creation.

- [ ] **Step 3: Run tests to verify failure**

Run: `cd graphite-trainer && npm test`

Expected: FAIL because prompt and progress modules do not exist.

- [ ] **Step 4: Implement prompt and progress modules**

Add deterministic prompt generation, word list, progress schema, and JSON persistence.

- [ ] **Step 5: Run tests**

Run: `cd graphite-trainer && npm test`

Expected: PASS.

## Task 3: Interactive CLI

**Files:**
- Create: `graphite-trainer/src/app.js`

**Interfaces:**
- Consumes: `renderLayoutRows()`, `physicalToGraphite()`, `graphiteToPhysical()`, `buildDrillPrompt()`, `wordPrompts`, `loadProgress()`, `saveProgress()`, `recordAttempt()`
- Produces: executable `npm start` terminal app

- [ ] **Step 1: Implement menu and render helpers**

Menu entries:

```text
Graphite Trainer
1 map
2 drill
3 words
4 ghost
5 stats
q quit
```

- [ ] **Step 2: Implement raw key practice sessions**

Use `readline.emitKeypressEvents(process.stdin)` and `process.stdin.setRawMode(true)`.

- [ ] **Step 3: Implement modes**

`map` prints the mapping rows.

`drill` prompts Graphite letters and expects current physical keys.

`words` prompts word list entries.

`ghost` prints translated Graphite output as physical keys are pressed.

`stats` prints attempts, accuracy, sessions, best streak, and top missed keys.

- [ ] **Step 4: Manual smoke test**

Run: `cd graphite-trainer && npm start`

Expected:

- `1` shows `q->b`.
- `4`, then `qwer`, shows Graphite output `bld`.
- `ctrl+c` restores terminal raw mode.

## Task 4: Verification and Commit

**Files:**
- Modify: all files created above

- [ ] **Step 1: Run full tests**

Run: `cd graphite-trainer && npm test`

Expected: PASS.

- [ ] **Step 2: Confirm firmware config is untouched**

Run: `git diff -- config/corne.keymap config/corne.conf`

Expected: no output.

- [ ] **Step 3: Commit implementation**

Use a conventional commit with a detailed provenance block and verification note.
