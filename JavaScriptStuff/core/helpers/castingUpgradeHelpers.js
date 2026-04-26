import { hasUpgrade, getUpgradeLevel, grantUpgradeLevel, getUpgradeMaxLevel } from "./upgradeHelpers.js";
import { toBigNum, multiplyBigNum, powerBigNum, addBigNum, zeroBigNum, oneBigNum, safeLog10BigNum, fromNumber, maxBigNum, makeBigNum, divideBigNumByNumber } from "../../utils/bigNum.js";
import { UPGRADES_MAIN } from "../../data/mainupgrades/upgradesMain.js";
import { UPGRADES_MAIN_4 } from "../../data/mainupgrades/upgradesMain4.js";

export function getCastingUpgradeConfig(state) {
  let pointMultiplier = oneBigNum();
  let patternMultiplier = oneBigNum();
  let patternFlat = 0;
  let shardMultiplier = oneBigNum();
  let castGain = oneBigNum();

  const shards = toBigNum(state.currencies.shards ?? 0);
  const casts = toBigNum(state.currencies.casts ?? 0);

  // Point multipliers
  if (hasUpgrade(state, "PRES10000", "castingUpgrades")) {
    let exponent = 0.25;

    if (hasUpgrade(state, "PRES10001", "castingUpgrades")) exponent = 1/3;
    if (hasUpgrade(state, "PRES10002", "castingUpgrades")) exponent = 1/2;
    if (hasUpgrade(state, "PRES10003", "castingUpgrades")) exponent = 1;

    pointMultiplier = multiplyBigNum(pointMultiplier, PRES1000XMultiplier(state, exponent));
  }

  // Shard gain multipliers
  const harvestLevel = getUpgradeLevel(state, "PRES10200", "castingUpgrades");
  if (harvestLevel > 0) {
    shardMultiplier = multiplyBigNum(shardMultiplier, PRES10200Multiplier(state, harvestLevel));
  }

  const scrapeLevel = getUpgradeLevel(state, "PRES10201", "castingUpgrades");
  if (scrapeLevel > 0) {
    shardMultiplier = multiplyBigNum(shardMultiplier, PRES10201Multiplier(state, scrapeLevel));
  }

  if (hasUpgrade(state, "PRES00101", "castingUpgrades")) {
    shardMultiplier = multiplyBigNum(shardMultiplier, PRES00101Multiplier(state));
  }

  if (hasUpgrade(state, "PRES00100", "castingUpgrades")) {
    shardMultiplier = multiplyBigNum(shardMultiplier, PRES00100Multiplier(state));
  }

  // Pattern bonuses
  if (hasUpgrade(state, "PRES10100", "castingUpgrades")) patternFlat += 5;
  if (hasUpgrade(state, "PRES10101", "castingUpgrades")) patternFlat += 25;

  if (hasUpgrade(state, "PRES10102", "castingUpgrades")) {
    patternMultiplier = multiplyBigNum(patternMultiplier, toBigNum(3));
  }

  if (hasUpgrade(state, "PRES10103", "castingUpgrades")) {
    patternMultiplier = multiplyBigNum(patternMultiplier, toBigNum(5));
  }

  // Cast gain
  const castAdd = getUpgradeLevel(state, "PRES10202", "castingUpgrades");
  if (castAdd > 0) {
    castGain = addBigNum(castGain, toBigNum(castAdd));
  }

  if (hasUpgrade(state, "PRES10203", "castingUpgrades")) {
    castGain = multiplyBigNum(castGain, toBigNum(2));
  }

  // Point multipliers
  if (hasUpgrade(state, "PRES00000", "castingUpgrades")) {
    pointMultiplier = multiplyBigNum(pointMultiplier, addBigNum(toBigNum(state.stats.totalCasts), toBigNum(1)));
  }

  if (hasUpgrade(state, "PRES00001", "castingUpgrades")) {
    pointMultiplier = multiplyBigNum(pointMultiplier, addBigNum(casts, toBigNum(1)));
  }

  return {
    pointMultiplier,
    patternMultiplier,
    patternFlat,
    shardMultiplier,
    castGain
  };
}

// To check what upgrades to max
const TIER_GRANT_GROUPS = [
  {
    unlockId: "DIG04",          
    previousTier: UPGRADES_MAIN 
  },
  {
    unlockId: "DIG05",
    previousTier: UPGRADES_MAIN_4
  }
];

// Maxes out the previous tier of upgrades
export function grantPreviousTierUpgrades(state, targetLevelMode) {
  for (const group of TIER_GRANT_GROUPS) {
    if (!hasUpgrade(state, group.unlockId)) continue;

    for (const upgrade of group.previousTier) {
      const targetLevel =
        targetLevelMode === "max"
          ? getUpgradeMaxLevel(state, upgrade, "upgrades")
          : 1;

      grantUpgradeLevel(
        state,
        upgrade.id,
        targetLevel,
        group.previousTier,
        "upgrades",
        { runOnBuy: true }
      );
    }
  }
}

// Returns multiplier-roll settings controlled by casting upgrades
export function getMultiplierRollConfig(state) {
  return {
    count: getMultiplierRollCount(state),
    dice: [
      getMultiplierRollDieConfig(state, 0),
      getMultiplierRollDieConfig(state, 1),
      getMultiplierRollDieConfig(state, 2)
    ]
  };
}

// Controls how many multiplier dice are active
function getMultiplierRollCount(state) {
  let count = 0;

  if (hasUpgrade(state, "PRES10004", "castingUpgrades")) count = 1;
  if (hasUpgrade(state, "PRES10104", "castingUpgrades")) count = 2;
  if (hasUpgrade(state, "PRES10204", "castingUpgrades")) count = 3;

  return count;
}

// Returns the range for one multiplier die
function getMultiplierRollDieConfig(state, dieIndex) {
  return getMultiplierRollDieConfigFromLevel(getMultiplierRollDieLevel(state, dieIndex));
}

// Stores ranges for getMultiplierRollDieConfig
// "flat" means random integer from min to max
// "exponent" means random BigNum from 10^minExp to 10^maxExp
export function getMultiplierRollDieConfigFromLevel(level) {
  if (level <= 0) {
    return {
      mode: "flat",
      min: 1,
      max: 10
    };
  }

  if (level === 1) {
    return { mode: "flat", min: 1, max: 100 };
  }

  if (level === 2) {
    return { mode: "flat", min: 10, max: 1000 };
  }

  if (level === 3) {
    return { mode: "flat", min: 100, max: 100000 };
  }

  const maxExp = 3 + 5 * (level - 3);
  return {
    mode: "exponent",
    minExp: 1,
    maxExp
  };
}

// Reads the upgrade level for each individual multiplier die
function getMultiplierRollDieLevel(state, dieIndex) {
  const ids = [
    "PRES10005",
    "PRES10105",
    "PRES10205"
  ];

  return getUpgradeLevel(state, ids[dieIndex], "castingUpgrades");
}

export function getMultiplierRollDieRangeText(state, dieIndex, levelOverride = null) {
  const config = getMultiplierRollDieConfigFromLevel(levelOverride ?? getMultiplierRollDieLevel(state, dieIndex));

  if (config.mode === "exponent") {
    return `×10^${config.minExp} to ×10^${config.maxExp}`;
  }

  return `×${config.min} to ×${config.max}`;
}

export function getShardMitosisPerSecond(state) {
  if (!hasUpgrade(state, "PRES00103", "castingUpgrades")) {
    return zeroBigNum();
  }

  return divideBigNumByNumber(state.stats.bestShardsPerCast ?? zeroBigNum(), 5000);
}

export function PRES00100Multiplier(state) {
  return powerBigNum(toBigNum(Math.max(1, (Date.now() - (state.stats.castStartTime ?? Date.now())) / 10000)), 0.2);
}

export function PRES00101Multiplier(state) {
  const logCastTotalRolls = Math.log10(state.stats.rollsThisCast / 100);
  return powerBigNum(fromNumber(2), Math.max(0, logCastTotalRolls));
}

export function PRES1000XMultiplier(state, exponent) {
  return powerBigNum(toBigNum(state.currencies.shards ?? oneBigNum), exponent);
}

export function PRES10200Multiplier(state, level) {
  return powerBigNum(toBigNum(2), level);
}

export function PRES10201Multiplier(state, level) {
  return powerBigNum(toBigNum(10), level);
}