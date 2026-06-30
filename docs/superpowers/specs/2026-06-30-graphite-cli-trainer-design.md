# Graphite CLI Trainer Design

## Goal

Build a terminal app for practicing Graphite before changing the ZMK keymap.

## Non-Goals

- Do not edit `config/corne.keymap`.
- Do not remap the OS keyboard.
- Do not require firmware flashing.

## User Experience

The app runs from `graphite-trainer` with `npm start`.

The first screen is an interactive menu:

- `map`: inspect the Corne physical key positions and their Graphite outputs.
- `drill`: practice prompted Graphite letters by pressing current physical keys.
- `words`: type short Graphite practice words through the current physical keys.
- `ghost`: free-type current physical keys and see the Graphite output.
- `stats`: view saved practice totals.

The trainer explains input in plain terms:

- "Press physical `q` to produce Graphite `b`."
- "You pressed physical `w`, which produces Graphite `l`."

## Layout Model

The app models the current Corne base layer as the physical input surface:

```text
q w f p b   j l u y ;
a r s t g   m n e i o
z x c d v   k h , . /
```

The Graphite output surface is:

```text
b l d w z   f o u j ;
n r t s g   y h a e i
q x m c v   k p , . /
```

The punctuation keys that stay in the same place keep their current meaning.

## Persistence

Stats are saved to `graphite-trainer/.graphite-trainer-progress.json`.

Saved stats:

- total attempts
- correct attempts
- completed sessions
- best streak
- per-key attempts and misses

## Implementation

Use a small Node.js ESM CLI with no runtime dependencies.

Files:

- `graphite-trainer/package.json`: scripts and Node version metadata.
- `graphite-trainer/src/layout.js`: physical-to-Graphite mapping and helpers.
- `graphite-trainer/src/progress.js`: progress file load/save and stat updates.
- `graphite-trainer/src/prompts.js`: drill and word prompt generation.
- `graphite-trainer/src/app.js`: terminal UI loop and raw key handling.
- `graphite-trainer/test/*.test.js`: Node test runner coverage for mapping, prompts, and progress.

## Error Handling

- If the progress file is missing, create fresh stats in memory.
- If the progress file is invalid JSON, keep a backup beside it and start fresh.
- If stdin is not interactive, exit with a plain error message.

## Validation

- `cd graphite-trainer && npm test`
- Manual smoke: `npm start`, open `map`, run `ghost`, press `qwer`, verify output `bldw`.
