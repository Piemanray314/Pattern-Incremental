import { makeUpgradeDefinition, makeUpgradePatternDefinition } from "../core/definitionHelpers.js";
import { compareBigNum, fromNumber, toBigNum } from "../utils/bigNum.js";

// Returns if the player has earned at least the given lifetime point total.
export function hasAtLeastPointsEarned(state, amount) {
  return compareBigNum(toBigNum(state.stats.lifetimePointsGained), fromNumber(amount)) >= 0;
}

// ID format:
// DIG## = digit unlock, where ## is the number of digits unlocked
// PAT/MULT/UNL###### = type + stage + row + column, each using 2 digits
// PAT = Pattern, MULT = Multiplier, UNL = Unlock

// An example with all fields:
/*
  {
    id: "DIG03",
    title: "Unlock 3 Digits",
    description: "Allows rolling 3-digit numbers.",
    cost: { points: 20000 },
    maxLevel: 1,
    x: 0,
    y: 0,
    parents: ["X"],
    visibleWhen: (state) => hasUpgrade(state, "X"),
    canBuyWhen: (state) => hasUpgrade(state, "X"),
    onBuy(state) {}
  }
*/
// cost can use any currency, and can be written as a fixed object, array by level, or function
// nodes connect from each upgrade to all IDs listed in parents
// makeUpgradeDefinition(type, stage, row, column, extra) auto-generates id, x, and y to reduce redundancy
// Upgrades that increase multiplier has logic in upgradeHelpers.js, and logic for specific patterns should be in pattern.js
// The upgrade to unlock the next tab should be UNL0X9999 and have their x, y values overwritten

// List of all upgrades in the main upgrade tree
export const UPGRADES_MAIN = [
  {
    id: "DIG01",
    title: "Unlock 1 Digit",
    description: "Allows rolling 1-digit numbers",
    cost: { points: 0 },
    maxLevel: 1,
    x: 0,
    y: 0,
    parents: [],
    visibleWhen: () => true,
    canBuyWhen: () => false,
    onBuy() {}
  },

  {
    id: "DIG02",
    title: "Unlock 2 Digits",
    description: "Allows rolling 2-digit numbers",
    cost: { points: 100 },
    maxLevel: 1,
    x: 0,
    y: 1,
    parents: ["DIG01"],
    visibleWhen: (state) =>
      hasUpgrade(state, "DIG01") &&
      state.stats.totalRolls >= 10,
    canBuyWhen: (state) => hasUpgrade(state, "DIG01"),
    onBuy(state) {
      state.progression.maxDigitsUnlocked = Math.max(
        state.progression.maxDigitsUnlocked,
        2
      );
    }
  },

  {
    id: "DIG03",
    title: "Unlock 3 Digits",
    description: "Allows rolling 3-digit numbers",
    cost: { points: 20000 },
    maxLevel: 1,
    x: 0,
    y: 2,
    parents: ["DIG02"],
    visibleWhen: (state) =>
      hasUpgrade(state, "DIG02") &&
      hasAtLeastPointsEarned(state, 5000),
    canBuyWhen: (state) => hasUpgrade(state, "DIG02"),
    onBuy(state) {
      state.progression.maxDigitsUnlocked = Math.max(
        state.progression.maxDigitsUnlocked,
        3
      );
    }
  },

  makeUpgradePatternDefinition("PAT", 2, 1, 1, "Even", {
    cost: { points: 1000 },
    maxLevel: 1,
    parents: ["DIG02"],
    visibleWhen: (state) => hasUpgrade(state, "DIG02"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG02"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 2, 1, 2, "Divisible by 5", {
    cost: { points: 2500 },
    maxLevel: 1,
    parents: ["DIG02"],
    visibleWhen: (state) => hasUpgrade(state, "DIG02"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG02"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 2, 1, 3, "Repeated Digits", {
    cost: { points: 3000 },
    maxLevel: 1,
    parents: ["DIG02"],
    visibleWhen: (state) => hasUpgrade(state, "DIG02"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG02"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 1, 4, "Full Flush", {
    cost: { points: 100000 },
    maxLevel: 1,
    parents: ["PAT020103"],
    visibleWhen: (state) =>
      hasUpgrade(state, "PAT020103") &&
      hasUpgrade(state, "DIG03"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT020103"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 2, 1, "Palindrome", {
    cost: { points: 250000 },
    maxLevel: 1,
    parents: ["DIG03"],
    visibleWhen: (state) => hasUpgrade(state, "DIG03"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG03"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 2, 2, "Lucky 7s", {
    cost: { points: 250000 },
    maxLevel: 1,
    parents: ["PAT030201", "PAT030104"],
    visibleWhen: (state) => hasUpgrade(state, "DIG03"),
    canBuyWhen: (state) => 
      hasUpgrade(state, "PAT030201") &&
      hasUpgrade(state, "PAT030104"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 2, 3, "Ascending", {
    cost: { points: 3000000 },
    maxLevel: 1,
    parents: ["PAT030202"],
    visibleWhen: (state) => 
      hasUpgrade(state, "DIG03") &&
      compareBigNum(toBigNum(state.stats.lifetimePointsGained), fromNumber(2000000)) >= 0,
    canBuyWhen: (state) => hasUpgrade(state, "PAT030201"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 2, 4, "Descending", {
    cost: { points: 3000000 },
    maxLevel: 1,
    parents: ["PAT030203"],
    visibleWhen: (state) => 
      hasUpgrade(state, "DIG03") &&
      compareBigNum(toBigNum(state.stats.lifetimePointsGained), fromNumber(2000000)) >= 0,
    canBuyWhen: (state) => hasUpgrade(state, "PAT030201"),
    onBuy() {}
  }),

  makeUpgradeDefinition("MULT", 3, 3, 1, {
    title: "Steady Income",
    description: "Flat +0.2x global multiplier",
    cost: (level) => ({ points: 10000 * Math.pow(10, level) }),
    maxLevel: 10,
    parents: ["DIG03"],
    visibleWhen: (state) => hasUpgrade(state, "DIG03"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG03"),
    onBuy() {}
  }),

  makeUpgradeDefinition("MULT", 3, 3, 2, {
    title: "Lucky Multiplier",
    description: "Lucky 7s base multiplier increase from 7x to 77x",
    cost: { points: 7770000 },
    maxLevel: 1,
    parents: ["MULT030301", "PAT030202"],
    visibleWhen: (state) => hasUpgrade(state, "DIG03"),
    canBuyWhen: (state) =>
      hasUpgrade(state, "MULT030301") &&
      hasUpgrade(state, "PAT030202"),
    onBuy() {}
  }),

  makeUpgradeDefinition("MULT", 3, 4, 1, {
    title: "Premium Value",
    description: "Flat +250 points before patterns",
    cost: [
      { patterns: 300 },
      { patterns: 600 },
      { patterns: 1000 },
      { patterns: 1500 },
      { patterns: 2500 }
    ],
    maxLevel: 5,
    x: 1,
    y: 4,
    parents: ["DIG03"],
    visibleWhen: (state) => hasUpgrade(state, "DIG03"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG03"),
    onBuy() {}
  }),

  makeUpgradeDefinition("MULT", 3, 4, 2, {
    title: "Pro Value",
    description: "Flat +1250 points before multipliers",
    cost: { points: 10000000 },
    maxLevel: 1,
    parents: ["MULT030401"],
    visibleWhen: (state) => hasUpgrade(state, "MULT030401"),
    canBuyWhen: (state) => hasUpgrade(state, "MULT030401"),
    onBuy() {}
  }),

  makeUpgradeDefinition("MULT", 3, 4, 3, {
    title: "Upcharge",
    description: "Flat +10000 points after multipliers",
    cost: [
      { patterns: 300 },
      { patterns: 600 },
      { patterns: 1000 },
      { patterns: 1500 },
      { patterns: 2500 }
    ],
    maxLevel: 5,
    parents: ["MULT030402"],
    visibleWhen: (state) => hasUpgrade(state, "MULT030401"),
    canBuyWhen: (state) => hasUpgrade(state, "MULT030401"),
    onBuy() {}
  }),

  makeUpgradeDefinition("MULT", 3, 4, 4, {
    title: "Supercharge",
    description: "Flat +50000 points after patterns",
    cost: { points: 10000000 },
    maxLevel: 1,
    parents: ["MULT030403"],
    visibleWhen: (state) => hasUpgrade(state, "MULT030401"),
    canBuyWhen: (state) => hasUpgrade(state, "MULT030401"),
    onBuy() {}
  }),

  makeUpgradeDefinition("UNL", 3, 0, 5, {
    title: "Pattern Pack: Basic",
    description: "Unlocks the first pattern pack",
    cost: { points: { mantissa: 1, exponent: 6 } },
    maxLevel: 1,
    x: 5, // Writing explicitly cause it's in a weird spot without parents + I can find this comment >:)
    y: 0,
    parents: [],
    visibleWhen: (state) => hasUpgrade(state, "DIG03"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG03"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 1, 5, "Square", {
    cost: { points: { mantissa: 5, exponent: 6 } },
    maxLevel: 1,
    parents: ["UNL030005"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL030005"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 1, 6, "Cubic", {
    cost: { points: { mantissa: 1, exponent: 7 } },
    maxLevel: 1,
    parents: ["PAT030105"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030105"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 1, 7, "Quartic", {
    cost: { points: { mantissa: 2, exponent: 7 } },
    maxLevel: 1,
    parents: ["PAT030106"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030106"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 1, 8, "Quintic", {
    cost: { points: { mantissa: 4, exponent: 7 } },
    maxLevel: 1,
    parents: ["PAT030107"],
    visibleWhen: (state) => hasUpgrade(state, "PAT030105"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030107"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 1, 9, "Sextic", {
    cost: { points: { mantissa: 8, exponent: 7 } },
    maxLevel: 1,
    parents: ["PAT030108"],
    visibleWhen: (state) => hasUpgrade(state, "PAT030105"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030108"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 1, 10, "Septic", {
    cost: { points: { mantissa: 1.6, exponent: 8 } },
    maxLevel: 1,
    parents: ["PAT030109"],
    visibleWhen: (state) => hasUpgrade(state, "PAT030105"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030109"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 1, 11, "Octic", {
    cost: { points: { mantissa: 3.2, exponent: 8 } },
    maxLevel: 1,
    parents: ["PAT030110"],
    visibleWhen: (state) => hasUpgrade(state, "PAT030105"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030110"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 1, 12, "Nonic", {
    cost: { points: { mantissa: 6.4, exponent: 8 } },
    maxLevel: 1,
    parents: ["PAT030111"],
    visibleWhen: (state) => hasUpgrade(state, "PAT030105"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030111"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 1, 13, "Decic", {
    cost: { points: { mantissa: 1.28, exponent: 9 } },
    maxLevel: 1,
    parents: ["PAT030112"],
    visibleWhen: (state) => hasUpgrade(state, "PAT030105"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030112"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 2, 5, "Lowball", {
    cost: { points: { mantissa: 1, exponent: 6 } },
    maxLevel: 1,
    parents: ["PAT030105"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL030005"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 2, 6, "Lowerball", {
    cost: { points: { mantissa: 1, exponent: 7 } },
    maxLevel: 1,
    parents: ["PAT030205"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030205"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 2, 7, "Lowestball", {
    cost: { points: { mantissa: 1, exponent: 8 } },
    maxLevel: 1,
    parents: ["PAT030205"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030205"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 3, 5, "Highball", {
    cost: { points: { mantissa: 1, exponent: 6 } },
    maxLevel: 1,
    parents: ["PAT030205"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL030005"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 3, 6, "Higherball", {
    cost: { points: { mantissa: 1, exponent: 7 } },
    maxLevel: 1,
    parents: ["PAT030305"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030305"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 3, 7, "Highestball", {
    cost: { points: { mantissa: 1, exponent: 8 } },
    maxLevel: 1,
    parents: ["PAT030305"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030305"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 2, 8, "Unique", {
    cost: { points: { mantissa: 4, exponent: 7 } },
    maxLevel: 1,
    parents: ["PAT030108"],
    visibleWhen: (state) => hasUpgrade(state, "PAT030108"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030108"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 2, 9, "Pure Even", {
    cost: { points: { mantissa: 1, exponent: 8 } },
    maxLevel: 1,
    parents: ["PAT030208"],
    visibleWhen: (state) => hasUpgrade(state, "PAT030108"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030208"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 3, 9, "Pure Odd", {
    cost: { points: { mantissa: 1, exponent: 8 } },
    maxLevel: 1,
    parents: ["PAT030208"],
    visibleWhen: (state) => hasUpgrade(state, "PAT030108"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030208"),
    onBuy() {}
  }),

  makeUpgradePatternDefinition("PAT", 3, 3, 8, "Alternating Parity", {
    cost: { points: { mantissa: 3, exponent: 8 } },
    maxLevel: 1,
    parents: ["PAT030208"],
    visibleWhen: (state) => hasUpgrade(state, "PAT030108"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030208"),
    onBuy() {}
  }),

  makeUpgradeDefinition("UNL", 3, 99, 99, {
    title: "Tier Up",
    description: "Unlocks the next tier (top of tree)",
    cost: { points: { mantissa: 1, exponent: 9 } },
    maxLevel: 1,
    x: 0,
    y: 5,
    parents: ["DIG03", "PAT030113", "PAT030308"],
    visibleWhen: (state) => 
      hasUpgrade(state, "PAT030113") ||
      hasUpgrade(state, "PAT030308"),
    canBuyWhen: (state) => 
      hasUpgrade(state, "PAT030113") &&
      hasUpgrade(state, "PAT030308"),
    onBuy() {}
  })
];

function hasUpgrade(state, upgradeId) {
  return (state.upgrades[upgradeId] ?? 0) > 0;
}