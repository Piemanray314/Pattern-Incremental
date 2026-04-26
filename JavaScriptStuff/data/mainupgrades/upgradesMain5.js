import { makeUpgradeDefinition, makeUpgradePatternDefinition } from "../../core/helpers/definitionHelpers.js";
import { hasUpgrade, MULT050002Multiplier, MULT050100Multiplier } from "../../core/helpers/upgradeHelpers.js";
import { compareBigNum, fromNumber, toBigNum, powerBigNum, multiplyBigNum } from "../../utils/bigNum.js";
import { grantPreviousTierUpgrades } from "../../core/helpers/castingUpgradeHelpers.js";
import { formatMultiplier } from "../../utils/format.js";

// For specifications regarding upgrade format, refer to upgradesMain.js

// List of all upgrades in the main upgrade tree tab 2, 4-digit upgrades
export const UPGRADES_MAIN_5 = [
  {
    id: "DIG05",
    title: "Unlock 5 Digits",
    description: "Allows rolling 5-digit numbers",
    cost: { points: 5 },
    maxLevel: 1,
    x: 0,
    y: 0,
    parents: [],
    visibleWhen: (state) => true,
    canBuyWhen: (state) => hasUpgrade(state, "DIG04"),
    onBuy(state) {
      state.progression.maxDigitsUnlocked = Math.max(
        state.progression.maxDigitsUnlocked, 5
      );
      if(hasUpgrade(state, "PRES00006", "castingUpgrades")) {
        grantPreviousTierUpgrades(state, "max");
      } else if (hasUpgrade(state, "PRES00005", "castingUpgrades")){
        grantPreviousTierUpgrades(state, "Only a singular level for you plebians who can't afford the higher level muahaha");
      }
    }
  },
  
  makeUpgradeDefinition("MULT", 5, 0, 2, {
    title: "Points IRA",
    description: "Multiply global multiplier based on time spent this cast",
    cost: { points: { mantissa: 1, exponent: 45 } },
    maxLevel: 1,
    parents: ["DIG05"],
    visibleWhen: (state) => hasUpgrade(state, "DIG05"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG05"),
    onBuy() {},
    effectText(state, level) {
      return formatMultiplier(MULT050002Multiplier(state));
    }
  }),
  
  makeUpgradeDefinition("MULT", 5, 1, 0, {
    title: "Pattern Partner",
    description: "Multiply global multiplier based on current pattern count",
    cost: { patterns: { mantissa: 2.5, exponent: 7 } },
    maxLevel: 1,
    parents: ["DIG05"],
    visibleWhen: (state) => hasUpgrade(state, "DIG05"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG05"),
    onBuy() {},
    effectText(state, level) {
      return formatMultiplier(MULT050100Multiplier(state));
    }
  }),
  
  makeUpgradeDefinition("MULT", 5, 2, 0, {
    title: "Patterns o' Plenty",
    description: "Multiply pattern gain by +0.5 (i.e. 1.5× > 2× > 2.5×)",
    cost: (level) => ({ patterns: multiplyBigNum({ mantissa: 5, exponent: 8 }, powerBigNum(2, level)) }),
    maxLevel: 5,
    parents: ["MULT050100"],
    visibleWhen: (state) => hasUpgrade(state, "MULT050100"),
    canBuyWhen: (state) => hasUpgrade(state, "MULT050100"),
    onBuy() {}
  }),

  makeUpgradeDefinition("UNL", 5, 2, 2, {
    title: "Patterns Pack: Poker-ish",
    description: "Unlocks patterns regarding Poker Hands",
    cost: { points: { mantissa: 1, exponent: 36 } },
    maxLevel: 1,
    parents: ["DIG05"],
    visibleWhen: (state) => hasUpgrade(state, "DIG05"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG05"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 3, 0, "Five of a Kind", {
    cost: { points: { mantissa: 1, exponent: 36 } },
    maxLevel: 1,
    parents: ["UNL050202"],
    visibleWhen: (state) => hasUpgrade(state, "UNL050202"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL050202"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 3, 1, "Four of a Kind", {
    cost: { points: { mantissa: 1, exponent: 36 } },
    maxLevel: 1,
    parents: ["UNL050202"],
    visibleWhen: (state) => hasUpgrade(state, "UNL050202"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL050202"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 3, 2, "Three of a Kind", {
    cost: { points: { mantissa: 1, exponent: 36 } },
    maxLevel: 1,
    parents: ["UNL050202"],
    visibleWhen: (state) => hasUpgrade(state, "UNL050202"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL050202"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 3, 3, "Two Pair", {
    cost: { points: { mantissa: 1, exponent: 36 } },
    maxLevel: 1,
    parents: ["UNL050202"],
    visibleWhen: (state) => hasUpgrade(state, "UNL050202"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL050202"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 3, 4, "One Pair", {
    cost: { points: { mantissa: 1, exponent: 36 } },
    maxLevel: 1,
    parents: ["UNL050202"],
    visibleWhen: (state) => hasUpgrade(state, "UNL050202"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL050202"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 4, 1, "Full House", {
    cost: { points: { mantissa: 1, exponent: 40 } },
    maxLevel: 1,
    parents: ["UNL050202"],
    visibleWhen: (state) => hasUpgrade(state, "UNL050202"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL050202"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 4, 2, "Straight", {
    cost: { points: { mantissa: 1, exponent: 40 } },
    maxLevel: 1,
    parents: ["UNL050202"],
    visibleWhen: (state) => hasUpgrade(state, "UNL050202"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL050202"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 4, 3, "High Card", {
    cost: { points: { mantissa: 1, exponent: 40 } },
    maxLevel: 1,
    parents: ["UNL050202"],
    visibleWhen: (state) => hasUpgrade(state, "UNL050202"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL050202"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 5, 2, "Low Card", {
    cost: { points: { mantissa: 1, exponent: 42 } },
    maxLevel: 1,
    parents: ["UNL050202"],
    visibleWhen: (state) => hasUpgrade(state, "UNL050202"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL050202"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 1, 2, "Connect 4", {
    cost: { points: { mantissa: 1, exponent: 45 } },
    maxLevel: 1,
    parents: ["DIG05"],
    visibleWhen: (state) => hasUpgrade(state, "DIG05"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG05"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 0, 3, "Leading The Charge", {
    cost: { points: { mantissa: 1, exponent: 47 } },
    maxLevel: 1,
    parents: ["PAT050102"],
    visibleWhen: (state) => hasUpgrade(state, "DIG05"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050102"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 1, 3, "Center of Attention", {
    cost: { points: { mantissa: 1, exponent: 47 } },
    maxLevel: 1,
    parents: ["PAT050102"],
    visibleWhen: (state) => hasUpgrade(state, "DIG05"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050102"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 2, 3, "Caboose", {
    cost: { points: { mantissa: 1, exponent: 47 } },
    maxLevel: 1,
    parents: ["PAT050102"],
    visibleWhen: (state) => hasUpgrade(state, "DIG05"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050102"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 0, 4, "High-diff", {
    cost: { points: { mantissa: 1, exponent: 50 } },
    maxLevel: 1,
    parents: ["PAT050103"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050102"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050103"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 1, 4, "Mid-off", {
    cost: { points: { mantissa: 1, exponent: 50 } },
    maxLevel: 1,
    parents: ["PAT050103"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050102"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050103"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 2, 4, "Low-diff", {
    cost: { points: { mantissa: 1, exponent: 50 } },
    maxLevel: 1,
    parents: ["PAT050103"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050102"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050103"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 0, 5, "Power of 2", {
    cost: { points: { mantissa: 1, exponent: 52 } },
    maxLevel: 1,
    parents: ["PAT050004", "PAT050104", "PAT050204"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050102"),
    canBuyWhen: (state) => 
      hasUpgrade(state, "PAT050004") &&
      hasUpgrade(state, "PAT050104") &&
      hasUpgrade(state, "PAT050204"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 1, 5, "Power of 3", {
    cost: { points: { mantissa: 1, exponent: 54 } },
    maxLevel: 1,
    parents: ["PAT050005"],
    visibleWhen: (state) => 
      hasUpgrade(state, "PAT050004") ||
      hasUpgrade(state, "PAT050005") ||
      hasUpgrade(state, "PAT050006"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050005"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 2, 5, "Power of 4", {
    cost: { points: { mantissa: 1, exponent: 56 } },
    maxLevel: 1,
    parents: ["PAT050105"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050105"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 3, 5, "Power of 5", {
    cost: { points: { mantissa: 1, exponent: 58 } },
    maxLevel: 1,
    parents: ["PAT050205"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050205"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 4, 5, "Power of 6", {
    cost: { points: { mantissa: 1, exponent: 60 } },
    maxLevel: 1,
    parents: ["PAT050305"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050305"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 5, 5, "Power of 7", {
    cost: { points: { mantissa: 1, exponent: 64 } },
    maxLevel: 1,
    parents: ["PAT050405"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050405"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 6, 5, "Power of 8", {
    cost: { points: { mantissa: 1, exponent: 68 } },
    maxLevel: 1,
    parents: ["PAT050505"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050505"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 7, 5, "Power of 9", {
    cost: { points: { mantissa: 1, exponent: 72 } },
    maxLevel: 1,
    parents: ["PAT050605"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050605"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 1, 6, "Alternating Digits", {
    cost: { points: { mantissa: 1, exponent: 55 } },
    maxLevel: 1,
    parents: ["PAT050105"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050105"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 1, 7, "Unstable", {
    cost: { points: { mantissa: 1, exponent: 56 } },
    maxLevel: 1,
    parents: ["PAT050106"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050105"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050106"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 2, 6, "Caged", {
    cost: { points: { mantissa: 1, exponent: 57 } },
    maxLevel: 1,
    parents: ["PAT050205"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050105"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050205"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 3, 6, "Qualitatively Equal", {
    cost: { points: { mantissa: 1, exponent: 59 } },
    maxLevel: 1,
    parents: ["PAT050305"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050205"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050305"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 4, 6, "Pure Chaos", {
    cost: { points: { mantissa: 1, exponent: 61 } },
    maxLevel: 1,
    parents: ["PAT050405"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050305"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050405"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 0, 6, "Outlier", {
    cost: { points: { mantissa: 1, exponent: 62 } },
    maxLevel: 1,
    parents: ["PAT050005"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050005"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 0, 7, "Outerlier", {
    cost: { points: { mantissa: 1, exponent: 64 } },
    maxLevel: 1,
    parents: ["PAT050006"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050006"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 5, 0, 8, "Outestlier", {
    cost: { points: { mantissa: 1, exponent: 66 } },
    maxLevel: 1,
    parents: ["PAT050007"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050005"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050007"),
    onBuy() {}
  }),

  makeUpgradeDefinition("UNL", 5, 0, 9, {
    title: "Patterns Pack: Mathematical Sequences [Not implemented yet]",
    description: "Unlocks \"common\" sequences in math",
    cost: { points: { mantissa: 1, exponent: 75 } },
    maxLevel: 1,
    parents: ["PAT050008"],
    visibleWhen: (state) => hasUpgrade(state, "PAT050006"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT050008"),
    onBuy() {}
  }),
  
  makeUpgradeDefinition("UNL", 5, 99, 99, {
    title: "Tier Up",
    description: "Unlocks the Linearithmic Tier",
    cost: { points: { mantissa: 1, exponent: 100 } },
    maxLevel: 1,
    x: 10,
    y: 0,
    parents: ["UNL050009"],
    visibleWhen: (state) => hasUpgrade(state, "UNL050009"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL050009"),
    onBuy() {}
  })
];