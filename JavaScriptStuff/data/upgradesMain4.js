import { makeUpgradeDefinition, makeUpgradePatternDefinition } from "../core/definitionHelpers.js";
import { hasUpgrade } from "../core/upgradeHelpers.js";
import { compareBigNum, fromNumber, toBigNum, powerBigNum, multiplyBigNum } from "../utils/bigNum.js";

// For specifications regarding upgrade format, refer to upgradesMain.js

// List of all upgrades in the main upgrade tree tab 2, 4-digit upgrades
export const UPGRADES_MAIN_4 = [
  {
    id: "DIG04",
    title: "Unlock 4 Digits",
    description: "Allows rolling 4-digit numbers",
    cost: { points: 2000000000 },
    maxLevel: 1,
    x: 0,
    y: 0,
    parents: [],
    visibleWhen: (state) => true,
    canBuyWhen: (state) => hasUpgrade(state, "DIG03"),
    onBuy(state) {
      state.progression.maxDigitsUnlocked = Math.max(
        state.progression.maxDigitsUnlocked,
        4
      );
    }
  },
  
  makeUpgradeDefinition("MULT", 4, 2, 2, {
    title: "Picking Up Steam",
    description: "Flat +25000 points before multipliers",
    cost: { points: { mantissa: 5, exponent: 8 } },
    maxLevel: 1,
    parents: ["DIG04"],
    visibleWhen: (state) => hasUpgrade(state, "DIG04"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG04"),
    onBuy() {}
  }),
  
  makeUpgradeDefinition("UNL", 4, 4, 2, {
    title: "Patterns Pack: Culture",
    description: "Unlocks patterns regarding significant numbers",
    cost: { points: { mantissa: 1, exponent: 9 } },
    maxLevel: 1,
    parents: ["MULT040202"],
    visibleWhen: (state) => hasUpgrade(state, "DIG04"),
    canBuyWhen: (state) => hasUpgrade(state, "MULT040202"),
    onBuy() {}
  }),
  
  makeUpgradeDefinition("MULT", 4, 2, 1, {
    title: "Global Appreciation",
    description: "Flat +0.5x to Global Multiplier",
    cost: (level) => ({ points: multiplyBigNum({ mantissa: 5, exponent: 9 }, powerBigNum(4, level)) }),
    maxLevel: 10,
    parents: ["MULT040202"],
    visibleWhen: (state) => hasUpgrade(state, "DIG04"),
    canBuyWhen: (state) => hasUpgrade(state, "MULT040202"),
    onBuy() {}
  }),
  
  makeUpgradeDefinition("MULT", 4, 2, 0, {
    title: "Pattern Appreciation",
    description: "Increase the multiplier of ALL patterns by +10% on manual rolls",
    cost: (level) => ({ points: multiplyBigNum({ mantissa: 1, exponent: 10 }, powerBigNum(10, level)) }),
    maxLevel: 10,
    parents: ["MULT040201"],
    visibleWhen: (state) => hasUpgrade(state, "MULT040202"),
    canBuyWhen: (state) => hasUpgrade(state, "MULT040202"),
    onBuy() {}
  }),
  
  makeUpgradeDefinition("MULT", 4, 1, 0, {
    title: "Pattern Inflation",
    description: "Increase the multiplier of ALL patterns by +4%",
    cost: (level) => ({ points: multiplyBigNum({ mantissa: 1, exponent: 12 }, powerBigNum(100, level)) }),
    maxLevel: 10,
    parents: ["MULT040200"],
    visibleWhen: (state) => hasUpgrade(state, "MULT040200"),
    canBuyWhen: (state) => hasUpgrade(state, "MULT040200"),
    onBuy() {}
  }),
  
  makeUpgradeDefinition("MULT", 4, 3, 0, {
    title: "Patterns Printing",
    description: "Increase pattern gain by +20%",
    cost: [
      { patterns: 4000 },
      { patterns: 16000 },
      { patterns: 36000 },
      { patterns: 64000 },
      { patterns: 100000 }
    ],
    maxLevel: 5,
    parents: ["MULT040200"],
    visibleWhen: (state) => hasUpgrade(state, "MULT040200"),
    canBuyWhen: (state) => hasUpgrade(state, "MULT040200"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 0, 2, "Luckier 7s", {
    cost: { points: { mantissa: 7.77, exponent: 9 } },
    maxLevel: 1,
    parents: ["MULT040202"],
    visibleWhen: (state) => hasUpgrade(state, "MULT040202"),
    canBuyWhen: (state) => hasUpgrade(state, "MULT040202"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 1, 3, "Double Trouble", {
    cost: { points: { mantissa: 5, exponent: 11 } },
    maxLevel: 1,
    parents: ["MULT040202"],
    visibleWhen: (state) => hasUpgrade(state, "MULT040202"),
    canBuyWhen: (state) => hasUpgrade(state, "MULT040202"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 0, 3, "Triple Terror", {
    cost: { points: { mantissa: 2, exponent: 12 } },
    maxLevel: 1,
    parents: ["PAT040103"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040103"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040103"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 0, 4, "Tic-Tac-Toe", {
    cost: { points: { mantissa: 4, exponent: 13 } },
    maxLevel: 1,
    parents: ["PAT040003"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040103"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040003"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 1, 4, "Couples", {
    cost: { points: { mantissa: 8, exponent: 12 } },
    maxLevel: 1,
    parents: ["PAT040103"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040103"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040103"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 3, 3, "Mini Sandwich", {
    cost: { points: { mantissa: 3, exponent: 12 } },
    maxLevel: 1,
    parents: ["MULT040202"],
    visibleWhen: (state) => hasUpgrade(state, "MULT040202"),
    canBuyWhen: (state) => hasUpgrade(state, "MULT040202"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 3, 4, "Sandwich", {
    cost: { points: { mantissa: 6, exponent: 13 } },
    maxLevel: 1,
    parents: ["PAT040303"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040303"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040303"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 4, 4, "Pure Sandwich", {
    cost: { points: { mantissa: 2, exponent: 14 } },
    maxLevel: 1,
    parents: ["PAT040303"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040303"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040303"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 2, 4, "3D", {
    cost: { points: { mantissa: 5, exponent: 12 } },
    maxLevel: 1,
    parents: ["MULT040202"],
    visibleWhen: (state) => hasUpgrade(state, "MULT040202"),
    canBuyWhen: (state) => hasUpgrade(state, "MULT040202"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 1, 5, "Hands Full", {
    cost: { points: { mantissa: 2, exponent: 14 } },
    maxLevel: 1,
    parents: ["PAT040204"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040204"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040204"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 0, 5, "Century", {
    cost: { points: { mantissa: 3, exponent: 15 } },
    maxLevel: 1,
    parents: ["PAT040105"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040204"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040105"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 0, 6, "M", {
    cost: { points: { mantissa: 1.2, exponent: 16 } },
    maxLevel: 1,
    parents: ["PAT040005"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040204"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040105"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 1, 6, "Loopy", {
    cost: { points: { mantissa: 9, exponent: 14 } },
    maxLevel: 1,
    parents: ["PAT040204"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040204"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040204"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 3, 5, "Community", {
    cost: { points: { mantissa: 2.4, exponent: 15 } },
    maxLevel: 1,
    parents: ["PAT040204"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040204"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040204"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 4, 5, "Neighborhood", {
    cost: { points: { mantissa: 1.2, exponent: 16 } },
    maxLevel: 1,
    parents: ["PAT040305"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040204"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040305"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 5, 5, "Roommate", {
    cost: { points: { mantissa: 9, exponent: 16 } },
    maxLevel: 1,
    parents: ["PAT040405"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040204"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040405"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 3, 6, "=SUM()", {
    cost: { points: { mantissa: 6, exponent: 15 } },
    maxLevel: 1,
    parents: ["PAT040204"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040204"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040204"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 4, 6, "=AVG()", {
    cost: { points: { mantissa: 7, exponent: 16 } },
    maxLevel: 1,
    parents: ["PAT040306"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040204"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040306"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 5, 6, "=PROD()", {
    cost: { points: { mantissa: 2.1, exponent: 17 } },
    maxLevel: 1,
    parents: ["PAT040406"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040204"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040406"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 2, 6, "Wormy", {
    cost: { points: { mantissa: 3.5, exponent: 19 } },
    maxLevel: 1,
    parents: ["PAT040204"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040204"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040204"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 1, 7, "Upstairs", {
    cost: { points: { mantissa: 5, exponent: 20 } },
    maxLevel: 1,
    parents: ["PAT040206"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040204"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040206"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 3, 7, "Downstairs", {
    cost: { points: { mantissa: 5, exponent: 20 } },
    maxLevel: 1,
    parents: ["PAT040206"],
    visibleWhen: (state) => hasUpgrade(state, "PAT040204"),
    canBuyWhen: (state) => hasUpgrade(state, "PAT040206"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("UNL", 4, 2, 7, "Current End Game", {
    cost: { points: { mantissa: 1, exponent: 30 } },
    maxLevel: 1,
    parents: ["PAT040307", "PAT040107"],
    visibleWhen: (state) =>
      hasUpgrade(state, "PAT040307") || 
      hasUpgrade(state, "PAT040107"),
    canBuyWhen: (state) => 
      hasUpgrade(state, "PAT040307") && 
      hasUpgrade(state, "PAT040107"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 5, 0, "Six Seven", {
    cost: { points: { mantissa: 6.7, exponent: 9 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 5, 1, "WYSI", {
    cost: { points: { mantissa: 7.27, exponent: 9 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 5, 2, "Satanic", {
    cost: { points: { mantissa: 6.66, exponent: 9 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 5, 3, "Gravity(-ish)", {
    cost: { points: { mantissa: 9.81, exponent: 9 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 5, 4, "8-bit", {
    cost: { points: { mantissa: 2.56, exponent: 9 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 6, 0, "hEll", {
    cost: { points: { mantissa: 1.134, exponent: 10 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 6, 1, "Immature", {
    cost: { points: { mantissa: 8.008, exponent: 10 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 6, 2, "IT'S OVER 9000!!!", {
    cost: { points: { mantissa: 9.001, exponent: 10 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 6, 3, "Dystopia", {
    cost: { points: { mantissa: 1.984, exponent: 10 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 6, 4, "Perfect Vision", {
    cost: { points: { mantissa: 2.02, exponent: 10 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 7, 0, "Elite", {
    cost: { points: { mantissa: 1.337, exponent: 11 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 7, 1, "Cannabis", {
    cost: { points: { mantissa: 4.2, exponent: 11 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 7, 2, "x86 Architecture", {
    cost: { points: { mantissa: 8.086, exponent: 11 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 7, 3, "Secure Password", {
    cost: { points: { mantissa: 1.234, exponent: 11 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 7, 4, "Moles", {
    cost: { points: { mantissa: 6.02, exponent: 11 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 8, 0, "Engineer's Pi", {
    cost: { points: { mantissa: 3.14, exponent: 12 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 8, 1, "Nice", {
    cost: { points: { mantissa: 6.9, exponent: 12 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 8, 2, "Aliens", {
    cost: { points: { mantissa: 5.2, exponent: 12 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 8, 3, "Not Found", {
    cost: { points: { mantissa: 4.04, exponent: 12 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  }),
  
  makeUpgradePatternDefinition("PAT", 4, 8, 4, "Answer to Life", {
    cost: { points: { mantissa: 4.2, exponent: 12 } },
    maxLevel: 1,
    parents: ["UNL040402"],
    visibleWhen: (state) => hasUpgrade(state, "UNL040402"),
    canBuyWhen: (state) => hasUpgrade(state, "UNL040402"),
    onBuy() {}
  })
];