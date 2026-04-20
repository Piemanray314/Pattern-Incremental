import { getUpgradeLevel, hasUpgrade } from "./upgradeHelpers.js";

const AUTO_STATE_KEY = "automationUpgrades"; // Default is the regular upgrades tab without this

// Returns the general information about automation settings
// Computes automation settings and derived multipliers based on upgrades
export function getAutomationConfig(state) {
  const unlocked = hasUpgrade(state, "AUTO030101", AUTO_STATE_KEY);

  const minIntervalMs = getAutomationMinIntervalMs(state);

  // Automation uses its own digit cap, disregarding DIGXX from upgrades
  let digitCap = 1;
  if (hasUpgrade(state, "AUTO030201", AUTO_STATE_KEY)) digitCap = 2;
  if (hasUpgrade(state, "AUTO030301", AUTO_STATE_KEY)) digitCap = 3;
  digitCap = Math.min(digitCap, state.progression.maxDigitsUnlocked);

  const globalMultiplierRecoveryLevel = getUpgradeLevel(state, "AUTO030100", AUTO_STATE_KEY);
  const patternMultiplierRecoveryLevel = getUpgradeLevel(state, "AUTO030001", AUTO_STATE_KEY);
  const patternRecoveryLevel = getUpgradeLevel(state, "AUTO030002", AUTO_STATE_KEY);

  // Default automation has 0.3x global/patterns multipliers, and a 0.8x multipler per pattern
  const globalMultiplierFactor = 0.3 + globalMultiplierRecoveryLevel * 0.1;  
  const patternMultiplierFactor = 0.8 + patternMultiplierRecoveryLevel * 0.04;
  const patternCurrencyFactor = 0.3 + patternRecoveryLevel * 0.25;

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

// Returns if auto-rolls should be displayed and how
export function shouldDisplayAutoRoll(state, rollResult) {
  const mode = state.automation.displayMode ?? "big_only";

  if (mode === "show_all") return true;
  if (mode === "show_none") return false;

  return Boolean(rollResult.enteredBestRolls);
}

// Calculates automation minimal interview with upgrades
export function getAutomationMinIntervalMs(state) {
  const intervalReductionLevels = getUpgradeLevel(state, "AUTO030102", AUTO_STATE_KEY);
  return Math.max(500, 10000 - intervalReductionLevels * 500);
}