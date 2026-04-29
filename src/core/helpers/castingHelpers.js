import { addBigNum, compareBigNum, divideBigNumByNumber, fromNumber, multiplyBigNum, oneBigNum, toBigNum, zeroBigNum, powerBigNum, maxBigNum, safeLog10BigNum } from "../../utils/bigNum.js";
import { createInitialState } from "../../state/initialState.js";
import { grantUpgradeLevel, hasUpgrade } from "./upgradeHelpers.js";
import { getCastingUpgradeConfig, getShardMitosisPerSecond, getShardPerSecond } from "./castingUpgradeHelpers.js";
import { UPGRADES_MAIN } from "../../data/mainupgrades/upgradesMain.js";
import { UPGRADES_MAIN_4 } from "../../data/mainupgrades/upgradesMain4.js";
import { resetAllTreeViewPositions } from "../../state/uiState.js";

const TARGETED_RECAST_AUTOMATION_WHITELIST = new Set([
  "AUTO030100", // Global Recovery
  "AUTO030001", // Pattern Recovery
  "AUTO030002", // Pattern Boost
  "AUTO030101", // Automation Core
  "AUTO030102"  // Interval Optimization
]);

const AUTO_RECAST_UNLOCK_UPGRADE_IDS = [
  "DIG04",
  "MULT040202",
  "PAT040204",
  "PAT040206",
  "PAT040107",
  "PAT040307",
  "UNL040207"
];

const AUTO_RECAST_CONDITIONS = {
  shards: "shards",
  casts: "casts",
  shardsPerSecond: "shardsPerSecond",
  points: "points",
  timeElapsed: "timeElapsed"
};

const SPEEDRUN_BURST_INTERVALS_MS = [100, 80, 70, 60, 50];
const SPEEDRUN_BURST_DURATIONS_MS = [5000, 6000, 7000, 8000, 10000];

// Returns the rewards the player would get if they recast
export function getCastingRewards(state) {
  const config = getCastingUpgradeConfig(state);
  const progress = getCurrentCastProgress(state);
  const points = toBigNum(progress.points);
  const patterns = toBigNum(progress.patterns);

  const pointsLog = toBigNum(safeLog10BigNum(points));
  const pointsFactor = powerBigNum(points ?? zeroBigNum, 0.02);
  const patternsLog = toBigNum(safeLog10BigNum(patterns));

  // Scales on (1/25) * log(points) * (points)^(1/50) * log(patterns)
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
export function performCast(state, { switchToCastingTab = true } = {}) {
  const progress = getCurrentCastProgress(state);
  const rewards = getCastingRewards(state);
  const fresh = createInitialState();
  const preCastStartTime = state.stats.castStartTime ?? Date.now();
  const previousCastsHistory = [...(state.stats.previousCasts ?? [])];

  // Save casting-layer progress before reset
  const keptCastingCurrencies = {
    casts: addBigNum(state.currencies.casts ?? zeroBigNum(), rewards.casts),
    shards: addBigNum(state.currencies.shards ?? zeroBigNum(), rewards.shards)
  };

  const keptAutomationUpgrades = hasUpgrade(state, "PRES00002", "castingUpgrades")
  ? Object.fromEntries(
      Object.entries(state.automationUpgrades ?? {}).filter(([id]) => {
        return TARGETED_RECAST_AUTOMATION_WHITELIST.has(id);
      })
    )
  : {};

  const keepTotalCasts = state.stats.totalCasts;
  const keepBestShardsPerCast = state.stats.bestShardsPerCast ?? zeroBigNum();
  const keepBestShardsPerCastPerSecond = state.stats.bestShardsPerCastPerSecond ?? zeroBigNum();
  const keptCastingUpgrades = { ...(state.castingUpgrades ?? {}) };
  const keptChallengeCompletions = { ...(state.challenges?.completions ?? {}) };

  const keptAutomationDisplay = {
    enabled: state.automation.enabled,
    intervalMs: state.automation.intervalMs,
    displayMode: state.automation.displayMode,
    recastSettings: {
      enabled: state.automation.recastSettings?.enabled ?? false,
      condition: state.automation.recastSettings?.condition ?? "shards",
      targetValue: state.automation.recastSettings?.targetValue ?? ""
    }
  };

  const keepSettings = {
    numberFormatMode: state.settings.numberFormatMode,
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
  state.automation.recastSettings = { ...keptAutomationDisplay.recastSettings };

  state.settings.numberFormatMode = keepSettings.numberFormatMode;
  state.challenges.completions = keptChallengeCompletions;

  state.stats.totalCasts = keepTotalCasts + 1;
  state.stats.previousCasts = [previousCastEntry, ...previousCastsHistory].slice(0, 10);

  state.stats.rollsThisCast = 0;
  state.stats.pointsThisCast = zeroBigNum();
  state.stats.patternsThisCast = zeroBigNum();

  const castDurationSeconds = Math.max(1, (Date.now() - preCastStartTime) / 1000);

  const shardsPerSecondThisCast = divideBigNumByNumber(
    rewards.shards ?? zeroBigNum(),
    castDurationSeconds
  );

  state.stats.bestShardsPerCast = maxBigNum(
    keepBestShardsPerCast,
    rewards.shards ?? zeroBigNum()
  );

  state.stats.bestShardsPerCastPerSecond = maxBigNum(
    keepBestShardsPerCastPerSecond,
    shardsPerSecondThisCast
  );
  
  state.stats.castStartTime = Date.now();

  state.progression.castingUnlocked = true;

  if (switchToCastingTab) {
    state.ui.activeTab = "casting";
    state.ui.castingSubtab = "recast";
  }

  resetAllTreeViewPositions(state);

  if (hasUpgrade(state, "PRES00004", "castingUpgrades")) {
    grantAllUpgradesInSource(state, UPGRADES_MAIN, "upgrades", { runOnBuy: true });
  }

  if (hasUpgrade(state, "PRES00003", "castingUpgrades")) {
    state.currencies.points = fromNumber(1e7);
    state.currencies.patterns = fromNumber(20000);
  }

  if (hasUpgrade(state, "PRES00202", "castingUpgrades")) {
    grantAutomaticRecastUnlockPath(state);
  }

  applySpeedrunAutoRollBurst(state);
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

// Grants all upgrades in X source (upgrades, automation, casting)
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

// Automatically buys all upgrades leading to and including recast
export function grantAutomaticRecastUnlockPath(state) {
  const combinedSource = [...UPGRADES_MAIN, ...UPGRADES_MAIN_4];

  for (const upgradeId of AUTO_RECAST_UNLOCK_UPGRADE_IDS) {
    grantUpgradeLevel(
      state,
      upgradeId,
      1,
      combinedSource,
      "upgrades",
      { runOnBuy: true }
    );
  }
}

// Handles logic regarding automatic recasts
export function shouldTriggerAutomaticRecast(state) {
  if (!hasUpgrade(state, "PRES00202", "castingUpgrades")) return false;
  if (!canCast(state)) return false;

  const settings = state.automation?.recastSettings;
  if (!settings?.enabled) return false;

  const target = parseAutoRecastTarget(settings.targetValue);
  if (target === null) return false;

  const condition = settings.condition ?? AUTO_RECAST_CONDITIONS.shards;

  if (condition === AUTO_RECAST_CONDITIONS.shards) {
    return compareBigNum(getCastingRewards(state).shards, toBigNum(target)) >= 0;
  }

  if (condition === AUTO_RECAST_CONDITIONS.casts) {
    return compareBigNum(getCastingRewards(state).casts, toBigNum(target)) >= 0;
  }

  if (condition === AUTO_RECAST_CONDITIONS.shardsPerSecond) {
    return compareBigNum(getShardPerSecond(state), toBigNum(target)) >= 0;
  }

  if (condition === AUTO_RECAST_CONDITIONS.points) {
    return compareBigNum(state.currencies.points ?? zeroBigNum(), toBigNum(target)) >= 0;
  }

  if (condition === AUTO_RECAST_CONDITIONS.timeElapsed) {
    const elapsedSeconds = (Date.now() - (state.stats.castStartTime ?? Date.now())) / 1000;
    return elapsedSeconds >= target;
  }

  return false;
}

// Parses inputs to be numbers and stuff yeah awesome cool
function parseAutoRecastTarget(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (text.length === 0) return null;

  const parsed = Number(text);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 0) return null;
  return parsed;
}

// Applies the Speedrun cast-start auto-roll burst reward
function applySpeedrunAutoRollBurst(state) {
  const completions = state.challenges?.completions?.["CHAL00101"] ?? 0;
  if (completions <= 0) return;

  const index = Math.max(0, Math.min(completions - 1, SPEEDRUN_BURST_INTERVALS_MS.length - 1));
  state.timers.speedrunAutoRollBurstAccumulatorMs = 0;
  state.timers.speedrunAutoRollBurstRemainingMs = SPEEDRUN_BURST_DURATIONS_MS[index];
  state.timers.speedrunAutoRollBurstIntervalMs = SPEEDRUN_BURST_INTERVALS_MS[index];
}
