import { makeUpgradeDefinition } from "../core/definitionHelpers.js";
import { hasUpgrade } from "../core/upgradeHelpers.js";
import { getAutomationMinIntervalMs } from "../core/automationHelpers.js"

// For specifications regarding upgrade format, refer to upgradesMain.js

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
    cost: [
      { patterns: 100 },
      { patterns: 150 },
      { patterns: 200 },
      { patterns: 250 },
      { patterns: 350 },
      { patterns: 500 },
      { patterns: 750 },
      { patterns: 1000 },
      { patterns: 1250 },
      { patterns: 1500 },
      { patterns: 2000 },
      { patterns: 2500 },
      { patterns: 4000 },
      { patterns: 8000 },
      { patterns: 12500 },
      { patterns: 25000 },
      { patterns: 50000 },
      { patterns: 100000 },
      { patterns: 1000000 }
    ],
    maxLevel: 19,
    parents: ["AUTO030101"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO030101", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO030101", "automationUpgrades"),
    onBuy(state) {
      state.automation.intervalMs = getAutomationMinIntervalMs(state);
    }
  }),

  makeUpgradeDefinition("AUTO", 3, 2, 1, {
    title: "Auto 2-Digit Routing",
    description: "Allows automation to roll up to 2 digits",
    cost: { points: { mantissa: 2, exponent: 6 }, patterns: 150 },
    maxLevel: 1,
    parents: ["AUTO030101"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO030101", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO030101", "automationUpgrades"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 3, 3, 1, {
    title: "Auto 3-Digit Routing",
    description: "Allows automation to roll up to 3 digits",
    cost: { points: { mantissa: 1, exponent: 8 }, patterns: 2500 },
    maxLevel: 1,
    parents: ["AUTO030201"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO030201", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO030201", "automationUpgrades") && hasUpgrade(state, "DIG03"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 4, 4, 1, {
    title: "Auto 4-Digit Routing",
    description: "Allows automation to roll up to 4 digits",
    cost: { points: { mantissa: 1, exponent: 12 }, patterns: 50000 },
    maxLevel: 1,
    parents: ["AUTO030301"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO030301", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO030301", "automationUpgrades") && hasUpgrade(state, "DIG04"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 3, 1, 0, {
    title: "Global Recovery",
    description: "Restores +10% global multiplier",
    cost: (level) => ({ points: { mantissa: 5 * Math.pow(3, level), exponent: 6 }, patterns: 250 * (level + 1) }),
    maxLevel: 7,
    parents: ["AUTO030101"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO030101", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO030101", "automationUpgrades"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 3, 0, 1, {
    title: "Pattern Recovery",
    description: "Restores +4% multiplier per pattern",
    cost: (level) => ({ points: { mantissa: 4 * Math.pow(2, level), exponent: 6 }, patterns: 400 * (level + 1) }),
    maxLevel: 5,
    parents: ["AUTO030101"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO030101", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO030101", "automationUpgrades"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 3, 0, 2, {
    title: "Pattern Boost",
    description: "Increases patterns gained by 25%",
    cost: (level) => ({ points: { mantissa: 4 * Math.pow(5, level), exponent: 11 }, patterns: 1000 * (level + 5) }),
    maxLevel: 10,
    parents: ["AUTO030102"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO030102", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO030102", "automationUpgrades"),
    onBuy() {}
  })
];
