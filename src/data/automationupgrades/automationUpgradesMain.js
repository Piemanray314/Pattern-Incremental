import { makeUpgradeDefinition } from "../../core/helpers/definitionHelpers.js";
import { hasUpgrade } from "../../core/helpers/upgradeHelpers.js";
import { getAutomationMinIntervalMs } from "../../core/helpers/automationHelpers.js"
import { multiplyBigNum, powerBigNum } from "../../utils/bigNum.js";

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

  makeUpgradeDefinition("AUTO", 6, 1, 3, {
    title: "Interval Subdivisions",
    description: "Reduces the minimum allowed auto-roll interval by 10 ms per level.",
    cost: (level) => ({ patterns: multiplyBigNum({ mantissa: 7.5, exponent: 8 }, powerBigNum(2, level)) }),
    maxLevel: 30,
    parents: ["AUTO030102", "AUTO060601"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO050501", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO060601", "automationUpgrades"),
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
    cost: { points: { mantissa: 1, exponent: 12 }, patterns: 30000 },
    maxLevel: 1,
    parents: ["AUTO030301"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO030301", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO030301", "automationUpgrades") && hasUpgrade(state, "DIG04"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 5, 5, 1, {
    title: "Auto 5-Digit Routing",
    description: "Allows automation to roll up to 5 digits",
    cost: { points: { mantissa: 1, exponent: 33 }, patterns: 30000 },
    maxLevel: 1,
    parents: ["AUTO040401"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO040401", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO040401", "automationUpgrades") && hasUpgrade(state, "DIG05"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 6, 6, 1, {
    title: "Auto 6-Digit Routing",
    description: "Allows automation to roll up to 6 digits",
    cost: { points: { mantissa: 1, exponent: 120 }, patterns: { mantissa: 2.147, exponent: 9 } },
    maxLevel: 1,
    parents: ["AUTO050501"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO050501", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO050501", "automationUpgrades") && hasUpgrade(state, "DIG05"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 7, 7, 1, {
    title: "Auto 7-Digit Routing",
    description: "Allows automation to roll up to 7 digits",
    cost: { points: { mantissa: 1, exponent: 1500 }, patterns: { mantissa: 1, exponent: 11 } },
    maxLevel: 1,
    parents: ["AUTO060601"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO060601", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO060601", "automationUpgrades") && hasUpgrade(state, "DIG06"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 8, 8, 1, {
    title: "Auto 8-Digit Routing",
    description: "Allows automation to roll up to 8 digits",
    cost: { points: { mantissa: 1, exponent: 25000 }, patterns: { mantissa: 1, exponent: 12 } },
    maxLevel: 1,
    parents: ["AUTO070701"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO070701", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO070701", "automationUpgrades") && hasUpgrade(state, "DIG07"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 9, 9, 1, {
    title: "Auto 9-Digit Routing",
    description: "Allows automation to roll up to 9 digits",
    cost: { points: { mantissa: 1, exponent: 1000000 }, patterns: { mantissa: 1, exponent: 15 } },
    maxLevel: 1,
    parents: ["AUTO080801"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO080801", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO080801", "automationUpgrades") && hasUpgrade(state, "DIG08"),
    onBuy() {}
  }),

  makeUpgradeDefinition("AUTO", 3, 1, 0, {
    title: "Global Recovery",
    description: "Restores +10% global multiplier",
    cost: (level) => ({ points: { mantissa: 5 * Math.pow(3, level), exponent: 6 }, patterns: 250 * (level + 1) }),
    maxLevel: 17,
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
  }),

  makeUpgradeDefinition("AUTO", 4, 4, 2, {
    title: "Compounding Interest",
    description: "Adds +8% multiplier per pattern on automatic rolls",
    cost: (level) => ({ points: { mantissa: 4 * Math.pow(2, level), exponent: 12 }, patterns: 400 * (level + 1) }),
    maxLevel: 5,
    parents: ["AUTO040401"],
    visibleWhen: (state) => hasUpgrade(state, "AUTO030301", "automationUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, "AUTO040401", "automationUpgrades"),
    onBuy() {}
  })
];
