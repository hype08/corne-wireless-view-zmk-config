export const PHYSICAL_ROWS = [
  ["q", "w", "f", "p", "b", "j", "l", "u", "y", ";"],
  ["a", "r", "s", "t", "g", "m", "n", "e", "i", "o"],
  ["z", "x", "c", "d", "v", "k", "h", ",", ".", "/"],
];

export const GRAPHITE_ROWS = [
  ["b", "l", "d", "w", "z", "f", "o", "u", "j", ";"],
  ["n", "r", "t", "s", "g", "y", "h", "a", "e", "i"],
  ["q", "x", "m", "c", "v", "k", "p", ",", ".", "/"],
];

const physicalToGraphiteMap = new Map();
const graphiteToPhysicalMap = new Map();

for (const [rowIndex, physicalRow] of PHYSICAL_ROWS.entries()) {
  for (const [keyIndex, physicalKey] of physicalRow.entries()) {
    const graphiteKey = GRAPHITE_ROWS[rowIndex][keyIndex];
    physicalToGraphiteMap.set(physicalKey, graphiteKey);
    graphiteToPhysicalMap.set(graphiteKey, physicalKey);
  }
}

export function physicalToGraphite(key) {
  return physicalToGraphiteMap.get(key.toLowerCase()) ?? null;
}

export function graphiteToPhysical(letter) {
  return graphiteToPhysicalMap.get(letter.toLowerCase()) ?? null;
}

export function renderLayoutRows() {
  return PHYSICAL_ROWS.map((physicalRow, rowIndex) => {
    const pairs = physicalRow.map((physicalKey, keyIndex) => {
      const graphiteKey = GRAPHITE_ROWS[rowIndex][keyIndex];
      return `${physicalKey}->${graphiteKey}`;
    });

    return `${pairs.slice(0, 5).join("  ")}      ${pairs.slice(5).join("  ")}`;
  });
}
