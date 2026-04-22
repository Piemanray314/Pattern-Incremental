import { addBigNum, compareBigNum, fromNumber, multiplyBigNum, oneBigNum, toBigNum, zeroBigNum, powerBigNum, maxBigNum, safeLog10BigNum } from "../utils/bigNum.js";
import { createInitialState } from "../state/initialState.js";
import { grantUpgradeLevel, hasUpgrade } from "./upgradeHelpers.js";
import { getCastingUpgradeConfig } from "./castingUpgradeHelpers.js";
import { UPGRADES_MAIN } from "../data/upgradesMain.js";

// Returns the rewards the player would get if they recast
export function getCastingRewards(state) {
  const config = getCastingUpgradeConfig(state);
  const progress = getCurrentCastProgress(state);
  const points = toBigNum(progress.points);
  const patterns = toBigNum(progress.patterns);

  const pointsLog = toBigNum(safeLog10BigNum(points));
  const pointsFactor = powerBigNum(points ?? zeroBigNum, 0.02);
  const patternsLog = toBigNum(safeLog10BigNum(patterns));

  // Scales on (1/20) * log(points) * (points)^(1/50) * log(patterns)
  const shardValue = multiplyBigNum(toBigNum(0.04), maxBigNum(zeroBigNum, multiplyBigNum(multiplyBigNum(pointsLog, pointsFactor), patternsLog)));
  const finalShards = multiplyBigNum(shardValue, config.shardMultiplier);
  return {
    casts: multiplyBigNum(oneBigNum(), config.castGain),
    shards: finalShards
  };
}

// Returns whether the player is allowed to recast right now
export function canCast(state) {
  return hasUpgrade(state, "UNL040207");
}

// Performs the first prestige layer reset
// Keeps casting currencies/upgrades and wipes only base-layer progress
export function performCast(state) {
  const progress = getCurrentCastProgress(state);
  const rewards = getCastingRewards(state);
  const fresh = createInitialState();

  // Save casting-layer progress before reset
  const keptCastingCurrencies = {
    casts: addBigNum(state.currencies.casts ?? zeroBigNum(), rewards.casts),
    shards: addBigNum(state.currencies.shards ?? zeroBigNum(), rewards.shards)
  };

  const keptAutomationUpgrades = hasUpgrade(state, "PRES00002", "castingUpgrades")
  ? Object.fromEntries(
      Object.entries(state.automationUpgrades ?? {}).filter(([id]) => {
        // Remove automation digit-cap unlocks, keep everything else
        return !["AUTO030201", "AUTO030301", "AUTO040401"].includes(id);
      })
    )
  : {};

  const keepTotalCasts = state.stats.totalCasts;
  const keptCastingUpgrades = { ...(state.castingUpgrades ?? {}) };

  const keptAutomationDisplay = {
    enabled: state.automation.enabled,
    intervalMs: state.automation.intervalMs,
    displayMode: state.automation.displayMode
  };

  const previousCastEntry = {
    rolls: progress.rolls ?? 0,
    points: progress.points ?? zeroBigNum(),
    patterns: progress.patterns ?? zeroBigNum(),
    castsGained: rewards.casts,
    shardsGained: rewards.shards,
    timestamp: Date.now()
  };

  // Bye bye !
  for (const key of Object.keys(state)) {
    delete state[key];
  }
  Object.assign(state, fresh);

  // Restore casting-layer progress
  state.currencies.casts = keptCastingCurrencies.casts;
  state.currencies.shards = keptCastingCurrencies.shards;

  state.automationUpgrades = keptAutomationUpgrades;
  state.castingUpgrades = keptCastingUpgrades;

  state.automation.enabled = keptAutomationDisplay.enabled;
  state.automation.intervalMs = keptAutomationDisplay.intervalMs;
  state.automation.displayMode = keptAutomationDisplay.displayMode;

  state.stats.totalCasts = keepTotalCasts + 1;
  state.stats.previousCasts = [previousCastEntry, ...(state.stats.previousCasts ?? [])].slice(0, 10);

  state.stats.rollsThisCast = 0;
  state.stats.pointsThisCast = zeroBigNum();
  state.stats.patternsThisCast = zeroBigNum();

  state.progression.castingUnlocked = true;

  state.ui.activeTab = "casting";
  state.ui.castingSubtab = "recast";

  state.ui.upgradeTreeView_main = { scrollLeft: 0, scrollTop: 0 };
  state.ui.upgradeTreeView_4 = { scrollLeft: 0, scrollTop: 0 };
  state.ui.upgradeTreeView_5 = { scrollLeft: 0, scrollTop: 0 };
  state.ui.automationTreeView = { scrollLeft: 0, scrollTop: 0 };

  if (hasUpgrade(state, "PRES00004", "castingUpgrades")) {
    grantAllUpgradesInSource(state, UPGRADES_MAIN, "upgrades", { runOnBuy: true });
  }

  if (hasUpgrade(state, "PRES00003", "castingUpgrades")) {
    state.currencies.points = fromNumber(1e7);
    state.currencies.patterns = fromNumber(20000);
  }
}

// Use lifetime gains instead of current cast on first cast
export function getCurrentCastProgress(state) {
  const isFirstCast = (state.stats.totalCasts ?? 0) === 0;

  return {
    rolls: isFirstCast ? (state.stats.totalRolls ?? 0) : (state.stats.rollsThisCast ?? 0),
    points: isFirstCast ? (state.stats.lifetimePointsGained ?? zeroBigNum()) : (state.stats.pointsThisCast ?? zeroBigNum()),
    patterns: isFirstCast ? (state.stats.lifetimePatternCurrency ?? zeroBigNum()) : (state.stats.patternsThisCast ?? zeroBigNum())
  };
}

export function grantAllUpgradesInSource(
  state,
  source,
  stateKey = "upgrades",
  { runOnBuy = true, targetLevels = null } = {}
) {
  for (const upgrade of source) {
    const targetLevel = targetLevels
      ? targetLevels(upgrade)
      : (upgrade.maxLevel ?? 1);

    grantUpgradeLevel(
      state,
      upgrade.id,
      targetLevel,
      source,
      stateKey,
      { runOnBuy }
    );
  }
}