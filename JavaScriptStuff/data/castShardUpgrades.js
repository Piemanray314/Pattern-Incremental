import { makePrestigeUpgradeDefinition, makeUpgradePatternDefinition } from "../core/definitionHelpers.js";
import { hasUpgrade } from "../core/upgradeHelpers.js";
import { compareBigNum, fromNumber, toBigNum, powerBigNum, multiplyBigNum } from "../utils/bigNum.js";

// For specifications regarding upgrade format, refer to upgradesMain.js

// List of all prestige upgrades
// ID is now PRES0XXYY for casts, PRES1XXYY for shards
export const PRESTIGE_CAST_SHARD = [
  makePrestigeUpgradeDefinition("PRES", 1, 0, 0, {
    title: "Shard Activation",
    description: "Multiplies point gain by current number of shards^(1/4)",
    cost: { shards: 1 },
    maxLevel: 1,
    parents: [],
    visibleWhen: () => true,
    canBuyWhen: () => true,
    onBuy() {}
  }),
  
  makePrestigeUpgradeDefinition("PRES", 1, 0, 1, {
    title: "Refined Shards",
    description: "Improves shard-point multiplier gain to current number of shards^(1/3)",
    cost: { shards: 5 },
    maxLevel: 1,
    parents: ["PRES10000"],
    visibleWhen: () => true,
    canBuyWhen: (state) => hasUpgrade(state, "PRES10000", "castingUpgrades"),
    onBuy() {}
  }),
  
  makePrestigeUpgradeDefinition("PRES", 1, 0, 2, {
    title: "Reinforced Shards",
    description: "Improves shard-point multiplier gain to current number of shards^(1/2)",
    cost: { shards: 25 },
    maxLevel: 1,
    parents: ["PRES10001"],
    visibleWhen: () => true,
    canBuyWhen: (state) => hasUpgrade(state, "PRES10001", "castingUpgrades"),
    onBuy() {}
  }),
  
  makePrestigeUpgradeDefinition("PRES", 1, 0, 3, {
    title: "Awoken Shards",
    description: "Improves shard-point multiplier gain to current number of shards",
    cost: { shards: 125 },
    maxLevel: 1,
    parents: ["PRES10002"],
    visibleWhen: () => true,
    canBuyWhen: (state) => hasUpgrade(state, "PRES10002", "castingUpgrades"),
    onBuy() {}
  }),

  makePrestigeUpgradeDefinition("PRES", 1, 1, 0, {
    title: "Patterned Shards",
    description: "Increase the base patterns gained per pattern by 5",
    cost: { shards: 5 },
    maxLevel: 1,
    parents: [],
    visibleWhen: () => true,
    canBuyWhen: () => true,
    onBuy() {}
  }),
  
  makePrestigeUpgradeDefinition("PRES", 1, 1, 1, {
    title: "Replicating Shards",
    description: "Increase the base patterns gained per pattern by 25",
    cost: { shards: 40 },
    maxLevel: 1,
    parents: ["PRES10100"],
    visibleWhen: () => true,
    canBuyWhen: (state) => hasUpgrade(state, "PRES10100", "castingUpgrades"),
    onBuy() {}
  }),
  
  makePrestigeUpgradeDefinition("PRES", 1, 1, 2, {
    title: "Fractal Shards",
    description: "Multiplies all patterns gain by 3",
    cost: { shards: 200 },
    maxLevel: 1,
    parents: ["PRES10101"],
    visibleWhen: () => true,
    canBuyWhen: (state) => hasUpgrade(state, "PRES10101", "castingUpgrades"),
    onBuy() {}
  }),
  
  makePrestigeUpgradeDefinition("PRES", 1, 1, 3, {
    title: "Dimensional Shards",
    description: "Multiplies all patterns gain by 5",
    cost: { shards: 1000 },
    maxLevel: 1,
    parents: ["PRES10102"],
    visibleWhen: () => true,
    canBuyWhen: (state) => hasUpgrade(state, "PRES10102", "castingUpgrades"),
    onBuy() {}
  }),
  
  makePrestigeUpgradeDefinition("PRES", 1, 2, 0, {
    title: "Harvesting Shards",
    description: "Multiplies shard gain by 2 per level",
    cost: (level) => ({ shards: { mantissa: 5, exponent: 1 + level } }),
    maxLevel: 5,
    parents: [],
    visibleWhen: () => true,
    canBuyWhen: () => true,
    onBuy() {}
  }),
  
  makePrestigeUpgradeDefinition("PRES", 1, 2, 1, {
    title: "Scraping for Shards",
    description: "Multiplies shard gain by 10 per level",
    cost: (level) => ({ shards: { mantissa: 1, exponent: 7 + 2 * level } }),
    maxLevel: 999999,
    parents: ["PRES10200"],
    visibleWhen: () => true,
    canBuyWhen: (state) => hasUpgrade(state, "PRES10200", "castingUpgrades"),
    onBuy() {}
  }),
  
  makePrestigeUpgradeDefinition("PRES", 1, 2, 2, {
    title: "Larger Casts",
    description: "Increases casts gained per recast by 1",
    cost: (level) => ({ shards: 100 + level * 150 }),
    maxLevel: 5,
    parents: [],
    visibleWhen: () => true,
    canBuyWhen: () => true,
    onBuy() {}
  }),
  
  makePrestigeUpgradeDefinition("PRES", 1, 2, 3, {
    title: "Brobdingnagian Casts",
    description: "Multiplies casts gained per recast by 2",
    cost: (level) => ({ shards: { mantissa: 2, exponent: 3 + level } }),
    maxLevel: 3,
    parents: ["PRES10202"],
    visibleWhen: () => true,
    canBuyWhen: (state) => hasUpgrade(state, "PRES10202", "castingUpgrades"),
    onBuy() {}
  })
];