import { makePrestigeUpgradeDefinition } from "../../core/helpers/definitionHelpers.js";
import { hasUpgrade } from "../../core/helpers/upgradeHelpers.js";
import { multiplyBigNum, powerBigNum, toBigNum } from "../../utils/bigNum.js";
import { formatMultiplier } from "../../utils/format.js";
import { getAncientHarnestingTierBoostMultiplierFromLevel, getIndustrialOvenLogPower, getPastryRevolutionLevelsPerUpgrade } from "../../core/helpers/pieFactoryHelpers.js";
const PASTRY_REVOLUTION_PARENT_ID = "PIES00000";

export const PIE_UPGRADES = [
  makePrestigeUpgradeDefinition("PIES", 0, 0, 0, {
    title: "Pastry Revolution",
    description: "Every X levels on a tier upgrades that tier by x10 output multiplicatively",
    cost: [
      { pies: { mantissa: 1, exponent: 27 } },
      { pies: { mantissa: 1, exponent: 60 } },
      { pies: { mantissa: 1, exponent: 120 } },
      { pies: { mantissa: 1, exponent: 300 } }
    ],
    maxLevel: 4,
    parents: [],
    visibleWhen: () => true,
    canBuyWhen: () => true,
    onBuy() {},
    effectText(state, level) {
      const threshold = getPastryRevolutionLevelsPerUpgrade(level);
      if (!threshold) return "Inactive";
      return `x10 output every ${threshold} levels`;
    }
  }),

  makePrestigeUpgradeDefinition("PIES", 0, 2, 0, {
    title: "Industrial Oven",
    description: "Increase Rebaked Pies multiplier from squared log to stronger log powers",
    cost: [
      { patterns: { mantissa: 2, exponent: 9 } },
      { patterns: { mantissa: 3, exponent: 10 } },
      { patterns: { mantissa: 5, exponent: 11 } },
      { patterns: { mantissa: 8, exponent: 12 } },
      { patterns: { mantissa: 1, exponent: 14 } }
    ],
    maxLevel: 5,
    parents: [PASTRY_REVOLUTION_PARENT_ID],
    visibleWhen: (state) => hasUpgrade(state, PASTRY_REVOLUTION_PARENT_ID, "pieUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, PASTRY_REVOLUTION_PARENT_ID, "pieUpgrades"),
    onBuy() {},
    effectText(state, level) {
      return `log^${getIndustrialOvenLogPower(level)}`;
    }
  }),

  makePrestigeUpgradeDefinition("PIES", 0, 2, 1, {
    title: "Eternal Pies",
    description: "Rebaking no longer resets current pies to 0",
    cost: { shards: { mantissa: 1, exponent: 10 } },
    maxLevel: 1,
    parents: [PASTRY_REVOLUTION_PARENT_ID],
    visibleWhen: (state) => hasUpgrade(state, PASTRY_REVOLUTION_PARENT_ID, "pieUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, PASTRY_REVOLUTION_PARENT_ID, "pieUpgrades"),
    onBuy() {}
  }),

  makePrestigeUpgradeDefinition("PIES", 0, 2, 2, {
    title: "Ancient Harnesting",
    description: "Each level multiplies Tier Boost effect by 20%",
    cost(level) {
      level = Math.max(0, Number(level ?? 0));
      const multiplier = 1 + level / 100 + (level ** 3) / 500;
      return {
        points: powerBigNum(toBigNum({ mantissa: 1, exponent: 100 }), multiplier)
      };
    },
    maxLevel: 50,
    parents: [PASTRY_REVOLUTION_PARENT_ID],
    visibleWhen: (state) => hasUpgrade(state, PASTRY_REVOLUTION_PARENT_ID, "pieUpgrades"),
    canBuyWhen: (state) => hasUpgrade(state, PASTRY_REVOLUTION_PARENT_ID, "pieUpgrades"),
    onBuy() {},
    effectText(state, level) {
      return formatMultiplier(getAncientHarnestingTierBoostMultiplierFromLevel(level));
    }
  })
];
