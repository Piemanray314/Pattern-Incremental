import { makePrestigeUpgradeDefinition, makeUpgradePatternDefinition } from "../core/definitionHelpers.js";
import { hasUpgrade } from "../core/upgradeHelpers.js";
import { compareBigNum, fromNumber, toBigNum, powerBigNum, multiplyBigNum } from "../utils/bigNum.js";

// For specifications regarding upgrade format, refer to upgradesMain.js

// List of all prestige upgrades
// ID is now PRES0XXYY for casts, PRES1XXYY for shards
export const PRESTIGE_CAST = [
  makePrestigeUpgradeDefinition("PRES", 0, 0, 0, {
    title: "Experienced Caster",
    description: "Multiply point gain by the total number of casts performed + 1",
    cost: { casts: 1 },
    maxLevel: 1,
    parents: [],
    visibleWhen: () => true,
    canBuyWhen: () => true,
    onBuy() {}
  }),

  makePrestigeUpgradeDefinition("PRES", 0, 0, 1, {
    title: "Recasting Investment",
    description: "Multiply point gain by current number of casts + 1",
    cost: { casts: 3 },
    maxLevel: 1,
    parents: [],
    visibleWhen: () => true,
    canBuyWhen: () => true,
    onBuy() {}
  }),

  makePrestigeUpgradeDefinition("PRES", 0, 0, 2, {
    title: "Targeted Recast",
    description: "Preserve automation upgrades except digit count after casts",
    cost: { casts: 5 },
    maxLevel: 1,
    parents: [],
    visibleWhen: () => true,
    canBuyWhen: () => true,
    onBuy() {}
  }),

  makePrestigeUpgradeDefinition("PRES", 0, 0, 3, {
    title: "Recasting Speedrun",
    description: "Start every cast with 10m points and 20k patterns",
    cost: { casts: 5 },
    maxLevel: 1,
    parents: [],
    visibleWhen: () => true,
    canBuyWhen: () => true,
    onBuy() {}
  }),

  makePrestigeUpgradeDefinition("PRES", 0, 0, 4, {
    title: "Any% Glitched Speedrun",
    description: "Start every cast with all Constant Tier upgrades unlocked",
    cost: { casts: 10 },
    maxLevel: 1,
    parents: ["PRES00003"],
    visibleWhen: () => true,
    canBuyWhen: (state) => hasUpgrade(state, "PRES00003", "castingUpgrades"),
    onBuy() {}
  }),

  makePrestigeUpgradeDefinition("PRES", 0, 1, 0, {
    title: "Steady Casting [not implemented]",
    description: "Increase shards gained by the time spent in this cast",
    cost: { casts: 10 },
    maxLevel: 1,
    parents: [],
    visibleWhen: () => true,
    canBuyWhen: () => true,
    onBuy() {}
  }),

  makePrestigeUpgradeDefinition("PRES", 0, 1, 1, {
    title: "Experienced Casting",
    description: "Increase shards gained by the total number of rolls in this cast",
    cost: { casts: 10 },
    maxLevel: 1,
    parents: [],
    visibleWhen: () => true,
    canBuyWhen: () => true,
    onBuy() {}
  }),

  makePrestigeUpgradeDefinition("PRES", 0, 1, 2, {
    title: "Deeper Casting",
    description: "Increases the max level of \"Pattern Inflation\" to 100",
    cost: { casts: 10 },
    maxLevel: 1,
    parents: [],
    visibleWhen: () => true,
    canBuyWhen: () => true,
    onBuy() {}
  })
];