import { makeUpgradeDefinition } from "./definitionHelpers.js";
import { hasUpgrade } from "../core/upgradeHelpers.js";

// For specifications regarding upgrade format, refer to upgrades.js

// List of all upgrades in the automation upgrade tree
export const AUTOMATION_UPGRADES = [
  makeUpgradeDefinition("AUTO", 3, 1, 1, {
    title: "Automation Core",
    description: "Unlocks automation controls.",
    cost: { points: { mantissa: 5, exponent: 5 } },
    maxLevel: 1,
    parents: ["DIG03"],
    visibleWhen: (state) => hasUpgrade(state, "DIG03"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG03"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 3, 1, 2, {
    title: "Interval Optimization",
    description: "Reduces the minimum allowed auto-roll interval by 500 ms per level.",
    cost: (level) => ({ points: { mantissa: 2.5 * Math.pow(4, level), exponent: 6 } }),
    maxLevel: 19,
    parents: ["AUTO030101"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO030101", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO030101", "automationUpgrades"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 3, 2, 1, {
    title: "Auto 2-Digit Routing",
    description: "Allows automation to roll up to 2 digits.",
    cost: { points: { mantissa: 2, exponent: 6 }, patterns: 150 },
    maxLevel: 1,
    parents: ["AUTO030101"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO030101", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO030101", "automationUpgrades"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 3, 3, 1, {
    title: "Auto 3-Digit Routing",
    description: "Allows automation to roll up to 3 digits.",
    cost: { points: { mantissa: 1, exponent: 8 }, patterns: 1000 },
    maxLevel: 1,
    parents: ["AUTO030201"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO030201", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO030201", "automationUpgrades") && hasUpgrade(state, "DIG03"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 3, 1, 0, {
    title: "Global Recovery",
    description: "Restores 10% of automation global multipliers per level.",
    cost: (level) => ({ points: { mantissa: 5 * Math.pow(3, level), exponent: 6 }, patterns: 250 * (level + 1) }),
    maxLevel: 5,
    parents: ["AUTO030101"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO030101", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO030101", "automationUpgrades"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 3, 0, 1, {
    title: "Pattern Recovery",
    description: "Restores 10% of automation pattern multipliers and pattern currency per level.",
    cost: (level) => ({ points: { mantissa: 4 * Math.pow(5, level), exponent: 6 }, patterns: 400 * (level + 1) }),
    maxLevel: 7,
    parents: ["AUTO030101"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO030101", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO030101", "automationUpgrades"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 3, 0, 2, {
    title: "Pattern Boost",
    description: "Increases automation pattern multipliers by 25% and pattern currency per level.",
    cost: (level) => ({ points: { mantissa: 4 * Math.pow(5, level), exponent: 11 }, patterns: 1000 * (level + 5) }),
    maxLevel: 10,
    parents: ["AUTO030102"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO030102", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO030102", "automationUpgrades"),
    onBuy() {}
  })
];
