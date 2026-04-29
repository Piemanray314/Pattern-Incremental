import { performRoll } from "./rollEngine.js";
import { getAutomationConfig } from "./helpers/automationHelpers.js";
import { hasUpgrade } from "./helpers/upgradeHelpers.js";
import { getShardMitosisPerSecond, grantPreviousTierUpgrades } from "./helpers/castingUpgradeHelpers.js";
import { addBigNum, multiplyBigNumByNumber } from "../utils/bigNum.js";
import { performCast, shouldTriggerAutomaticRecast } from "./helpers/castingHelpers.js";
import { isAutoRollBlockedByChallenge, updateChallengeRuntime } from "./helpers/challengeHelpers.js";

const AUTO_RECAST_MIN_INTERVAL_MS = 1000;

// Main game loop
export function updateGame(state, deltaMs) {
  // Dictates what parts of the UI to re-rendered this frame
  const instructions = {
    topbar: false,
    content: false,
    sidebar: false,
    effectText: false,
    topbarLive: false
  };

  state.timers.uiRefreshAccumulatorMs += deltaMs;
  state.timers.effectTextRefreshAccumulatorMs += deltaMs;
  state.timers.topbarLiveRefreshAccumulatorMs += deltaMs;
  state.timers.autoRecastCooldownMs = Math.max(
    0,
    (state.timers.autoRecastCooldownMs ?? 0) - deltaMs
  );

  const automationConfig = getAutomationConfig(state);
  updateChallengeRuntime(state, deltaMs);
  runSpeedrunAutoRollBurst(state, deltaMs, instructions);

  if (automationConfig.unlocked && state.automation.enabled && !isAutoRollBlockedByChallenge(state)) {
    state.automation.accumulatorMs += deltaMs;

    const effectiveIntervalMs = automationConfig.effectiveIntervalMs;

    while (state.automation.accumulatorMs >= effectiveIntervalMs) {
      state.automation.accumulatorMs -= effectiveIntervalMs;
      const rollResult = performRoll(state, { source: "auto" });

      instructions.topbarLive = true;

      if (state.ui.activeTab === "stats" || state.ui.activeTab === "bestRolls") {
        instructions.content = true;
      }
    }
  }

  // Passive shard gain
  const shardMitosisPerSecond = getShardMitosisPerSecond(state);

  if (shardMitosisPerSecond.mantissa !== 0) {
    const gain = multiplyBigNumByNumber(shardMitosisPerSecond, deltaMs / 1000);
    state.currencies.shards = addBigNum(state.currencies.shards, gain);
  }

  if (state.timers.autoRecastCooldownMs <= 0 && shouldTriggerAutomaticRecast(state)) {
    performCast(state, { switchToCastingTab: false });
    state.timers.autoRecastCooldownMs = AUTO_RECAST_MIN_INTERVAL_MS;
    instructions.topbar = true;
    instructions.content = state.ui.activeTab === "casting";
    instructions.sidebar = false;
    instructions.topbarLive = true;
  }

  // Refreshes the UI at most 4 times a second
  if ((state.ui.activeTab === "stats") && state.timers.uiRefreshAccumulatorMs >= 250) {
    state.timers.uiRefreshAccumulatorMs = 0;
    instructions.content = true;
  }
  if (state.timers.effectTextRefreshAccumulatorMs >= 1000) {
    state.timers.effectTextRefreshAccumulatorMs = 0;
    instructions.effectText = true;
  }

  // Refreshes the topbar currencies 10 times a second
  if (state.timers.topbarLiveRefreshAccumulatorMs >= 100) {
    state.timers.topbarLiveRefreshAccumulatorMs = 0;
    instructions.topbarLive = true;
  }

  return instructions;
}

// Runs Speedrun reward auto-roll burst at cast start
function runSpeedrunAutoRollBurst(state, deltaMs, instructions) {
  const remainingMs = state.timers.speedrunAutoRollBurstRemainingMs ?? 0;
  if (remainingMs <= 0) return;
  if (isAutoRollBlockedByChallenge(state)) return;

  const intervalMs = Math.max(1, state.timers.speedrunAutoRollBurstIntervalMs ?? 100);
  state.timers.speedrunAutoRollBurstRemainingMs = Math.max(0, remainingMs - deltaMs);
  state.timers.speedrunAutoRollBurstAccumulatorMs =
    (state.timers.speedrunAutoRollBurstAccumulatorMs ?? 0) + deltaMs;

  while (state.timers.speedrunAutoRollBurstAccumulatorMs >= intervalMs) {
    state.timers.speedrunAutoRollBurstAccumulatorMs -= intervalMs;
    performRoll(state, { source: "auto" });
    instructions.topbarLive = true;

    if (state.ui.activeTab === "stats" || state.ui.activeTab === "bestRolls") {
      instructions.content = true;
    }
  }
}
