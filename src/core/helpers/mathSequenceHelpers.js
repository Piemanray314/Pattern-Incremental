import { numberStringToValue } from "./patternHelpers.js";

const MAX_VALUE = 999_999_999;

function makeSet(generator) {
  const set = new Set();
  for (const value of generator()) {
    if (value > MAX_VALUE) break;
    if (value > 0) set.add(value);
  }
  return set;
}

export const FIBONACCI_SET = makeSet(function* () {
  let a = 1, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
});

export const LUCAS_SET = makeSet(function* () {
  let a = 2, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
});

export const ONE_SIDED_POLYOMINO_SET = new Set([
  1, 2, 7, 18, 60, 196, 704, 2500, 9189, 33896,
  126759, 476270, 1802312, 6849777, 26152418,
  100203194, 385221143
]);

export const TRIANGULAR_SET = makeSet(function* () {
  for (let n = 1; ; n++) yield (n * (n + 1)) / 2;
});
export const PENTAGONAL_SET = makeSet(function* () {
  for (let n = 1; ; n++) yield (n * (3 * n - 1)) / 2;
});

export const HEXAGONAL_SET = makeSet(function* () {
  for (let n = 1; ; n++) yield n * (2 * n - 1);
});

export const TETRAHEDRAL_SET = makeSet(function* () {
  for (let n = 1; ; n++) yield (n * (n + 1) * (n + 2)) / 6;
});

export const CATALAN_SET = makeSet(function* () {
  let c = 1;
  for (let n = 0; ; n++) {
    yield c;
    c = c * (4 * n + 2) / (n + 2);
  }
});

export const BELL_SET = new Set([
  1, 2, 5, 15, 52, 203, 877, 4140, 21147, 115975,
  678570, 4213597, 27644437, 190899322
]);

export const FACTORIAL_SET = makeSet(function* () {
  let value = 1;
  for (let n = 1; ; n++) {
    value *= n;
    yield value;
  }
});

export const FERMAT_SET = new Set([
  3, 5, 17, 257, 65537
]);

export const PERFECT_SET = new Set([
  6, 28, 496, 8128, 33550336
]);

export const LEYLAND_SET = makeSet(function* () {
  const values = new Set();

  for (let x = 2; x <= 1000; x++) {
    for (let y = 2; y <= 1000; y++) {
      const value = x ** y + y ** x;
      if (value <= MAX_VALUE) values.add(value);
    }
  }

  yield* [...values].sort((a, b) => a - b);
});

export const CAYLEY_TREE_SET = makeSet(function* () {
  for (let n = 2; ; n++) yield n ** (n - 2);
});

// Only goes up to 6 digits
export const MARKOV_SET = new Set([
  1, 2, 5, 13, 29, 34, 89, 169, 194, 233, 433, 610,
  985, 1325, 1597, 2897, 4181, 5741, 6466, 7561,
  9077, 10946, 14701, 28657, 33461, 37666, 43261,
  51641, 62210, 75025, 96557, 135137, 195025,
  196418, 294685, 357445, 646018, 756097
]);

export const HIGHLY_COMPOSITE_SET = new Set([
  1, 2, 4, 6, 12, 24, 36, 48, 60, 120, 180, 240,
  360, 720, 840, 1260, 1680, 2520, 5040, 7560,
  10080, 15120, 20160, 25200, 27720, 45360,
  50400, 55440, 83160, 110880, 166320, 221760,
  277200, 332640, 498960, 554400, 665280, 720720,
  1081080, 1441440, 2162160, 2882880, 3603600,
  4324320, 6486480, 7207200, 8648640, 10810800,
  14414400, 17297280, 21621600, 32432400, 36756720,
  43243200, 61261200, 73513440, 110270160, 122522400,
  147026880, 183783600, 245044800, 294053760, 367567200,
  551350800, 698377680, 735134400
]);

// Only goes up to 6 digits
export const HARMONIC_DIVISOR_SET = new Set([
  1, 6, 28, 140, 270, 496, 672, 1638, 2970, 6200,
  8128, 8190, 18600, 18620, 27846, 30240, 32760,
  55860, 105664, 117800, 167400, 173600, 237510,
  242060, 332640, 360360, 539400, 695520, 726180,
  753480, 950976
]);

export const WEDDERBURN_ETHERINGTON_SET = new Set([
  1, 1, 1, 2, 3, 6, 11, 23, 46, 98, 207, 451,
  983, 2179, 4850, 10905, 24631, 56011, 127912,
  293547, 676157, 1563372, 3626149, 8436379,
  19677820, 45995730, 107728831, 252987067,
  594243014
]);

export function isInSequence(rollString, sequenceSet) {
  return sequenceSet.has(numberStringToValue(rollString));
}
