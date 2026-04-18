import { makeUpgradeDefinition } from "./definitionHelpers.js";
import { compareBigNum, fromNumber, toBigNum } from "../utils/bigNum.js";

export function hasAtLeastPointsEarned(state, amount) {
  return compareBigNum(toBigNum(state.stats.lifetimePointsGained), fromNumber(amount)) >= 0;
}

export const UPGRADES = [
  {
    id: "DIG01",
    title: "Unlock 1 Digit",
    description: "Allows rolling 1-digit numbers.",
    cost: { points: 0 },
    maxLevel: 1,
    x: 0,
    y: 0,
    parents: [],
    visibleWhen: () => true,
    canBuyWhen: () => false,
    onBuy() {}
  },

  // DIG00 = Digit + (00)How many digits
  // PAT/MULT/UNL 000000 = (00)Roll Digits + (00)Row # + (00)Column #
  // PAT = Pattern, MULT = Multiplier, UNL = Unlock

  {
    id: "DIG02",
    title: "Unlock 2 Digits",
    description: "Allows rolling 2-digit numbers.",
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
    description: "Allows rolling 3-digit numbers.",
    cost: { points: 20000 },
    maxLevel: 1,
    x: 0,
    y: 2,
    parents: ["DIG02"],
    visibleWhen: (state) =>
      hasUpgrade(state, "DIG02") &&
      // compareBigNum(toBigNum(state.stats.lifetimePointsGained), fromNumber(5000)) >= 0,
      hasAtLeastPointsEarned(state, 5000),
    canBuyWhen: (state) => hasUpgrade(state, "DIG02"),
    onBuy(state) {
      state.progression.maxDigitsUnlocked = Math.max(
        state.progression.maxDigitsUnlocked,
        3
      );
    }
  },

  makeUpgradeDefinition("PAT", 2, 1, 1, {
    title: "Pattern: Even",
    description: "Unlocks the Even pattern.",
    cost: { points: 1000 },
    maxLevel: 1,
    parents: ["DIG02"],
    visibleWhen: (state) => hasUpgrade(state, "DIG02"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG02"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 2, 1, 2, {
    title: "Pattern: Divisible by 5",
    description: "Unlocks the Divisible by 5 pattern.",
    cost: { points: 2500 },
    maxLevel: 1,
    parents: ["DIG02"],
    visibleWhen: (state) => hasUpgrade(state, "DIG02"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG02"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 2, 1, 3, {
    title: "Pattern: Repeated Digits",
    description: "Unlocks the Repeated Digits pattern.",
    cost: { points: 3000 },
    maxLevel: 1,
    parents: ["DIG02"],
    visibleWhen: (state) => hasUpgrade(state, "DIG02"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG02"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 2, 1, 4, {
    title: "Pattern: All Identical Digits",
    description: "Unlocks the All Identical Digits pattern.",
    cost: { points: 100000 },
    maxLevel: 1,
    parents: ["PAT020103"],
    visibleWhen: (state) =>
      hasUpgrade(state, "PAT020103") &&
      hasUpgrade(state, "DIG03"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT020103"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 2, 1, {
    title: "Pattern: Palindrome",
    description: "Unlocks the Palindrome pattern.",
    cost: { points: 250000 },
    maxLevel: 1,
    parents: ["DIG03"],
    visibleWhen: (state) => hasUpgrade(state, "DIG03"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG03"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 2, 2, {
    title: "Pattern: Lucky 7s",
    description: "Unlocks the Lucky 7s pattern.",
    cost: { points: 250000 },
    maxLevel: 1,
    parents: ["PAT030201"],
    visibleWhen: (state) => hasUpgrade(state, "DIG03"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030201"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 2, 3, {
    title: "Pattern: Increasing",
    description: "Unlocks the Increasing pattern.",
    cost: { points: 3000000 },
    maxLevel: 1,
    parents: ["PAT030202"],
    visibleWhen: (state) => 
      hasUpgrade(state, "DIG03") &&
      compareBigNum(toBigNum(state.stats.lifetimePointsGained), fromNumber(2000000)) >= 0,
    canBuyWhen: (state) => hasUpgrade(state, "PAT030201"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 2, 4, {
    title: "Pattern: Decreasing",
    description: "Unlocks the Decreasing pattern.",
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
    cost: (level) => ({ points: 1000000 * Math.pow(25, level) }),
    maxLevel: 10,
    parents: ["DIG03"],
    visibleWhen: (state) => hasUpgrade(state, "DIG03"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG03"),
    onBuy() {}
  }),

  makeUpgradeDefinition("MULT", 3, 3, 2, {
    title: "Lucky Multiplier",
    description: "Flat +7x if pattern includes 777",
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
    description: "Flat +1250 points before patterns",
    cost: { points: 10000000 },
    maxLevel: 1,
    parents: ["MULT030401"],
    visibleWhen: (state) => hasUpgrade(state, "MULT030401"),
    canBuyWhen: (state) => hasUpgrade(state, "MULT030401"),
    onBuy() {}
  }),

  makeUpgradeDefinition("MULT", 3, 4, 3, {
    title: "Upcharge",
    description: "Flat +10000 points after patterns",
    cost: [
      { patterns: 1000 },
      { patterns: 2000 },
      { patterns: 3000 },
      { patterns: 4000 },
      { patterns: 5000 }
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
    title: "Pattern Pack",
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

  makeUpgradeDefinition("PAT", 3, 1, 5, {
    title: "Square",
    description: "Unlocks the Square pattern",
    cost: { points: { mantissa: 1, exponent: 7 } },
    maxLevel: 1,
    parents: ["UNL030005"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL030005"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 1, 6, {
    title: "Cubic",
    description: "Unlocks the Cubic pattern",
    cost: { points: { mantissa: 1, exponent: 7 } },
    maxLevel: 1,
    parents: ["PAT030105"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030105"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 1, 7, {
    title: "Quartic",
    description: "Unlocks the Quartic pattern",
    cost: { points: { mantissa: 2, exponent: 7 } },
    maxLevel: 1,
    parents: ["PAT030106"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030105"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 1, 8, {
    title: "Quintic",
    description: "Unlocks the Quintic pattern",
    cost: { points: { mantissa: 4, exponent: 7 } },
    maxLevel: 1,
    parents: ["PAT030107"],
    visibleWhen: (state) => hasUpgrade(state, "PAT030105"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030105"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 1, 9, {
    title: "Sextic",
    description: "Unlocks the Sextic pattern",
    cost: { points: { mantissa: 8, exponent: 7 } },
    maxLevel: 1,
    parents: ["PAT030108"],
    visibleWhen: (state) => hasUpgrade(state, "PAT030105"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030105"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 1, 10, {
    title: "Septic",
    description: "Unlocks the Septic pattern",
    cost: { points: { mantissa: 1.6, exponent: 8 } },
    maxLevel: 1,
    parents: ["PAT030109"],
    visibleWhen: (state) => hasUpgrade(state, "PAT030105"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030105"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 1, 11, {
    title: "Octic",
    description: "Unlocks the Octic pattern",
    cost: { points: { mantissa: 3.2, exponent: 8 } },
    maxLevel: 1,
    parents: ["PAT030110"],
    visibleWhen: (state) => hasUpgrade(state, "PAT030105"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030105"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 1, 12, {
    title: "Nonic",
    description: "Unlocks the Nonic pattern",
    cost: { points: { mantissa: 6.4, exponent: 8 } },
    maxLevel: 1,
    parents: ["PAT030111"],
    visibleWhen: (state) => hasUpgrade(state, "PAT030105"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030105"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 1, 13, {
    title: "Decic",
    description: "Unlocks the Decic pattern",
    cost: { points: { mantissa: 1.28, exponent: 9 } },
    maxLevel: 1,
    parents: ["PAT030112"],
    visibleWhen: (state) => hasUpgrade(state, "PAT030105"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030105"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 2, 5, {
    title: "Lowball",
    description: "Unlocks the Lowball pattern",
    cost: { points: { mantissa: 1, exponent: 6 } },
    maxLevel: 1,
    parents: ["PAT030105"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL030005"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 2, 6, {
    title: "Lowerball",
    description: "Unlocks the Lowballer pattern",
    cost: { points: { mantissa: 1, exponent: 7 } },
    maxLevel: 1,
    parents: ["PAT030205"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030205"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 2, 7, {
    title: "Lowestball",
    description: "Unlocks the Lowestball pattern",
    cost: { points: { mantissa: 1, exponent: 8 } },
    maxLevel: 1,
    parents: ["PAT030205"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030205"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 3, 5, {
    title: "Highball",
    description: "Unlocks the Highball pattern",
    cost: { points: { mantissa: 1, exponent: 6 } },
    maxLevel: 1,
    parents: ["PAT030205"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL030005"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 3, 6, {
    title: "Higherball",
    description: "Unlocks the Higherball pattern",
    cost: { points: { mantissa: 1, exponent: 7 } },
    maxLevel: 1,
    parents: ["PAT030305"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030305"),
    onBuy() {}
  }),

  makeUpgradeDefinition("PAT", 3, 3, 7, {
    title: "Highestball",
    description: "Unlocks the Highestball pattern",
    cost: { points: { mantissa: 1, exponent: 8 } },
    maxLevel: 1,
    parents: ["PAT030305"],
    visibleWhen: (state) => hasUpgrade(state, "UNL030005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT030305"),
    onBuy() {}
  })
];

function hasUpgrade(state, upgradeId) {
  return (state.upgrades[upgradeId] ?? 0) > 0;
}