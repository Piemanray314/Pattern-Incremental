import { getUpgradeLevel, hasUpgrade } from "./upgradeHelpers.js";

const AUTO_STATE_KEY = "automationUpgrades";

export function getAutomationConfig(state) {
  const unlocked = hasUpgrade(state, "AUTO030101", AUTO_STATE_KEY);

  const intervalReductionLevels = getUpgradeLevel(state, "AUTO030102", AUTO_STATE_KEY);
  const minIntervalMs = Math.max(500, 10000 - intervalReductionLevels * 500);

  let digitCap = 1;
  if (hasUpgrade(state, "AUTO030201", AUTO_STATE_KEY)) digitCap = 2;
  if (hasUpgrade(state, "AUTO030301", AUTO_STATE_KEY)) digitCap = 3;
  digitCap = Math.min(digitCap, state.progression.maxDigitsUnlocked);

  const globalMultiplierRecoveryLevel = getUpgradeLevel(state, "AUTO030100", AUTO_STATE_KEY);
  const patternMultiplierRecoveryLevel = getUpgradeLevel(state, "AUTO030001", AUTO_STATE_KEY);
  const patternRecoveryLevel = getUpgradeLevel(state, "AUTO030002", AUTO_STATE_KEY);

  const globalMultiplierFactor = Math.min(1, 0.3 + globalMultiplierRecoveryLevel * 0.1);  
  const patternMultiplierFactor = Math.min(1, 0.3 + patternMultiplierRecoveryLevel * 0.1 + patternMultiplierRecoveryLevel * 0.2);
  const patternCurrencyFactor = Math.min(1, 0.3 + patternRecoveryLevel * 0.1 + patternRecoveryLevel * 0.2);

  return {
    unlocked,
    minIntervalMs,
    digitCap,
    globalMultiplierFactor,
    patternMultiplierFactor,
    patternCurrencyFactor,
    effectiveIntervalMs: Math.max(state.automation.intervalMs, minIntervalMs)
  };
}

export function shouldDisplayAutoRoll(state, rollResult) {
  const mode = state.automation.displayMode ?? "big_only";

  if (mode === "show_all") return true;
  if (mode === "show_none") return false;

  return Boolean(rollResult.enteredBestRolls);
}