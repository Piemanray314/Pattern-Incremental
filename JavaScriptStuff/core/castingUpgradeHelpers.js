import { hasUpgrade, getUpgradeLevel } from "./upgradeHelpers.js";
import { toBigNum, multiplyBigNum, powerBigNum, addBigNum, oneBigNum, safeLog10BigNum, fromNumber, maxBigNum, makeBigNum } from "../utils/bigNum.js";

export function getCastingUpgradeConfig(state) {
  let pointMultiplier = oneBigNum();
  let patternMultiplier = oneBigNum();
  let patternFlat = 0;
  let shardMultiplier = oneBigNum();
  let castGain = oneBigNum();

  const shards = toBigNum(state.currencies.shards ?? 0);
  const casts = toBigNum(state.currencies.casts ?? 0);

  // Shard point multipliers
  if (hasUpgrade(state, "PRES10000", "castingUpgrades")) {
    let exponent = 0.25;

    if (hasUpgrade(state, "PRES10001", "castingUpgrades")) exponent = 1/3;
    if (hasUpgrade(state, "PRES10002", "castingUpgrades")) exponent = 1/2;
    if (hasUpgrade(state, "PRES10003", "castingUpgrades")) exponent = 1;

    pointMultiplier = multiplyBigNum(pointMultiplier, powerBigNum(shards, exponent));
  }

  // Shard gain multipliers
  const harvestLevel = getUpgradeLevel(state, "PRES10200", "castingUpgrades");
  if (harvestLevel > 0) {
    shardMultiplier = multiplyBigNum(shardMultiplier, powerBigNum(toBigNum(2), harvestLevel));
  }

  const scrapeLevel = getUpgradeLevel(state, "PRES10201", "castingUpgrades");
  if (scrapeLevel > 0) {
    shardMultiplier = multiplyBigNum(shardMultiplier, powerBigNum(toBigNum(10), scrapeLevel));
  }

  if (hasUpgrade(state, "PRES00101", "castingUpgrades")) {
    const logCastTotalRolls = safeLog10BigNum(toBigNum(state.stats.rollsThisCast))
    shardMultiplier = multiplyBigNum(shardMultiplier, addBigNum(oneBigNum(), powerBigNum(fromNumber(2), maxBigNum(oneBigNum(), logCastTotalRolls))));
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