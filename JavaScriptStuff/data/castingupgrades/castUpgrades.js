import { makePrestigeUpgradeDefinition, makeUpgradePatternDefinition } from "../../core/helpers/definitionHelpers.js";
import { hasUpgrade } from "../../core/helpers/upgradeHelpers.js";
import { compareBigNum, fromNumber, toBigNum, powerBigNum, multiplyBigNum } from "../../utils/bigNum.js";
import { formatMultiplier } from "../../utils/format.js";
import { PRES00100Multiplier, PRES00101Multiplier } from "../../core/helpers/castingUpgradeHelpers.js";

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
    description: "Preserve automation upgrades unlocked before Auto 2-Digit Routing after casts",
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
    title: "Tier 1 Glitched Speedrun",
    description: "Start every cast with all Constant Tier upgrades unlocked",
    cost: { casts: 10 },
    maxLevel: 1,
    parents: ["PRES00003"],
    visibleWhen: () => true,
    canBuyWhen: (state) => hasUpgrade(state, "PRES00003", "castingUpgrades"),
    onBuy() {}
  }),

  makePrestigeUpgradeDefinition("PRES", 0, 0, 5, {
    title: "Any% Glitched TAS",
    description: "Unlocking X tier will autobuy all upgrades from the tier before to level 1",
    cost: { casts: 100 },
    maxLevel: 1,
    parents: ["PRES00004"],
    visibleWhen: () => true,
    canBuyWhen: (state) => hasUpgrade(state, "PRES00004", "castingUpgrades"),
    onBuy() {
      grantPreviousTierUpgrades(state, "Only a singular level for you plebians who can't afford the higher level muahaha");
    }
  }),

  makePrestigeUpgradeDefinition("PRES", 0, 0, 6, {
    title: "100% Glitched TAS",
    description: "Unlocking X tier will autobuy all upgrades from the tier before to max level",
    cost: { casts: 10000 },
    maxLevel: 1,
    parents: ["PRES00005"],
    visibleWhen: () => true,
    canBuyWhen: (state) => hasUpgrade(state, "PRES00005", "castingUpgrades"),
    onBuy() {
      grantPreviousTierUpgrades(state, "max");
    }
  }),

  makePrestigeUpgradeDefinition("PRES", 0, 1, 0, {
    title: "Steady Casting",
    description: "Increase shards gained by the time spent in this cast",
    cost: { casts: 10 },
    maxLevel: 1,
    parents: [],
    visibleWhen: () => true,
    canBuyWhen: () => true,
    onBuy() {},
    effectText(state) {
      return formatMultiplier(PRES00100Multiplier(state));
    }
  }),

  makePrestigeUpgradeDefinition("PRES", 0, 1, 1, {
    title: "Experienced Casting",
    description: "Increase shards gained by the total number of rolls in this cast",
    cost: { casts: 10 },
    maxLevel: 1,
    parents: [],
    visibleWhen: () => true,
    canBuyWhen: () => true,
    onBuy() {},
    effectText(state) {
      return formatMultiplier(PRES00101Multiplier(state));
    }
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