import { UPGRADES_MAIN } from "../../data/mainupgrades/upgradesMain.js";
import { compareBigNum, subtractBigNum, toBigNum, addBigNum, multiplyBigNumByNumber, oneBigNum, zeroBigNum, roundMultiplierBigNum, safeLog10BigNum, powerBigNum, multiplyBigNum } from "../../utils/bigNum.js";

// Current state keys are "upgrades" and "automationUpgrades"

// Returns all upgrade logic roll effects
// rollData is passed for future flexibility, even if some effects do not use it yet
export function getUpgradeConfig(state) {
  return {
    preMultiplierFlatBonus: getPreMultiplierFlatBonus(state),
    globalMultiplier: getGlobalMultiplier(state),
    postMultiplierFlatBonus: getPostMultiplierFlatBonus(state),
    patternMultiplierFactor: getPatternMultiplierFactor(state),
    patternCurrencyFactor: getPatternCurrencyFactor(state),
    manualGlobalMultiplier: getManualGlobalMultiplier(state),
    manualPatternMultiplierFactor: getManualPatternMultiplierFactor(state),
    manualPatternCurrencyFactor: getManualPatternCurrencyFactor(state)
  };
}

// Flat value added before multipliers
export function getPreMultiplierFlatBonus(state) {
  let bonus = zeroBigNum();

  bonus = addBigNum(bonus,
    multiplyBigNumByNumber(oneBigNum(), 250 * getUpgradeLevel(state, "MULT030401")));
  bonus = addBigNum(bonus,
    multiplyBigNumByNumber(oneBigNum(), 1250 * getUpgradeLevel(state, "MULT030402")));
  bonus = addBigNum(bonus,
    multiplyBigNumByNumber(oneBigNum(), 25000 * getUpgradeLevel(state, "MULT040202")));

  return bonus;
}

// Global multiplier applied after pattern multipliers
export function getGlobalMultiplier(state) {
  let multiplier = oneBigNum();

  multiplier = addBigNum(
    multiplier, multiplyBigNumByNumber(oneBigNum(), 0.2 * getUpgradeLevel(state, "MULT030301"))
  );

  multiplier = addBigNum(
    multiplier, multiplyBigNumByNumber(oneBigNum(), 0.5 * getUpgradeLevel(state, "MULT040201"))
  );

  if (hasUpgrade(state, "MULT050002")) {
    multiplier = multiplyBigNum(multiplier, MULT050002Multiplier(state));
  }
  if (hasUpgrade(state, "MULT050100")) {
    multiplier = multiplyBigNum(multiplier, MULT050100Multiplier(state));
  }

  return roundMultiplierBigNum(multiplier);
}

// Flat value added after all multipliers
export function getPostMultiplierFlatBonus(state) {
  let bonus = zeroBigNum();

  bonus = addBigNum(
    bonus, multiplyBigNumByNumber(oneBigNum(), 10000 * getUpgradeLevel(state, "MULT030403"))
  );

  bonus = addBigNum(
    bonus, multiplyBigNumByNumber(oneBigNum(), 50000 * getUpgradeLevel(state, "MULT030404"))
  );

  return bonus;
}

// Multiplier to each individual pattern (scales very hard)
export function getPatternMultiplierFactor(state) {
  let multiplier = oneBigNum();

  multiplier = addBigNum(
    multiplier, multiplyBigNumByNumber(oneBigNum(), 0.04 * getUpgradeLevel(state, "MULT040100"))
  );

  return multiplier;
}

// Multiplier to the pattern currency
export function getPatternCurrencyFactor(state) {
  let multiplier = oneBigNum();

  multiplier = addBigNum(
    multiplier, multiplyBigNumByNumber(oneBigNum(), 0.2 * getUpgradeLevel(state, "MULT040300"))
  );

  multiplier = multiplyBigNumByNumber(multiplier, 1 + 0.5 * getUpgradeLevel(state, "MULT050200"));

  return multiplier;
}

// Global multiplier applied after pattern multipliers on manual rolls
export function getManualGlobalMultiplier(state) {
  let multiplier = oneBigNum();

  return roundMultiplierBigNum(multiplier);
}

// Manual multiplier to each individual pattern (scales very hard)
export function getManualPatternMultiplierFactor(state) {
  let multiplier = oneBigNum();

  multiplier = addBigNum(
    multiplier,
    multiplyBigNumByNumber(oneBigNum(), 0.1 * getUpgradeLevel(state, "MULT040200"))
  );

  return multiplier;
}

// Manual multiplier to the pattern currency
export function getManualPatternCurrencyFactor(state) {
  let multiplier = oneBigNum();

  return multiplier;
}

// Retrieves upgrade level (default from upgrades tab)
export function getUpgradeLevel(state, upgradeId, stateKey = "upgrades") {
  // ?. means if state[stateKey] exists, access upgradeId. Otherwise, it returns undefined (which turns into 0)
  return state[stateKey]?.[upgradeId] ?? 0;
}

// Checks if given upgrade has been purchased
export function hasUpgrade(state, upgradeId, stateKey = "upgrades") {
  return getUpgradeLevel(state, upgradeId, stateKey) > 0;
}

// Checks if player has all upgrades / any upgrades
/*
export function hasAllUpgrades(state, upgradeIds, stateKey = "upgrades") {
  return upgradeIds.every((id) => hasUpgrade(state, id, stateKey));
}

export function hasAnyUpgrade(state, upgradeIds, stateKey = "upgrades") {
  return upgradeIds.some((id) => hasUpgrade(state, id, stateKey));
} */

// Buys a given upgrade if possible
export function buyUpgrade(state, upgradeId, source = UPGRADES_MAIN, stateKey = "upgrades") {
  const upgrade = getUpgradeDefinition(upgradeId, source);
  if (!upgrade) return false;

  const currentLevel = getUpgradeLevel(state, upgradeId, stateKey);
  const maxLevel = getUpgradeMaxLevel(state, upgrade, stateKey);

  if (currentLevel >= maxLevel) return false;
  if (!upgrade.visibleWhen(state)) return false;
  if (!upgrade.canBuyWhen(state)) return false;

  const cost = getUpgradeCost(state, upgrade, stateKey);
  if (!cost) return false;
  if (!canAffordCost(state, cost)) return false;

  payCost(state, cost);

  if (!state[stateKey]) state[stateKey] = {};
  state[stateKey][upgradeId] = currentLevel + 1;

  if (typeof upgrade.onBuy === "function") {
    upgrade.onBuy(state, state[stateKey][upgradeId]);
  }

  return true;
}

// Returns the upgrade object with the given ID from the provided source list
export function getUpgradeDefinition(upgradeId, source = UPGRADES_MAIN) {
  return source.find((item) => item.id === upgradeId) ?? null;
}

// Gets the current cost of an upgrade, supporting constant, array, and function definitions
export function getUpgradeCost(state, upgrade, stateKey = upgrade.stateKey ?? "upgrades") {
  const currentLevel = getUpgradeLevel(state, upgrade.id, stateKey);
  const costDef = upgrade.cost;

  if (typeof costDef === "function") {
    return normalizeCostObject(costDef(currentLevel, state));
  }

  if (Array.isArray(costDef)) {
    return normalizeCostObject(costDef[currentLevel] ?? null);
  }

  return normalizeCostObject(costDef);
}

// Returns the current max level of an upgrade, supporting constants and functions
export function getUpgradeMaxLevel(state, upgrade, stateKey = upgrade.stateKey ?? "upgrades") {
  const maxLevelDef = upgrade.maxLevel ?? 1;

  if (typeof maxLevelDef === "function") {
    return maxLevelDef(state, stateKey);
  }

  return maxLevelDef;
}

// Normalizes a raw cost object so all currency amounts use BigNum values
export function normalizeCostObject(cost) {
  if (!cost) return null;

  const normalized = {};
  for (const [currency, amount] of Object.entries(cost)) {
    normalized[currency] = toBigNum(amount);
  }
  return normalized;
}

// Returns true if the player has enough currency to pay the given cost (ignoring other potential conditions)
export function canAffordCost(state, cost) {
  if (!cost) return false;

  return Object.entries(cost).every(([currency, amount]) => {
    return compareBigNum(state.currencies[currency] ?? 0, amount) >= 0;
  });
}

// Subtracts cost of upgrade from held currency amount
export function payCost(state, cost) {
  for (const [currency, amount] of Object.entries(cost)) {
    state.currencies[currency] = subtractBigNum(
      state.currencies[currency] ?? 0,
      amount
    );
  }
}

// Grants an upgrade directly without paying cost
export function grantUpgradeLevel(
  state,
  upgradeId,
  targetLevel,
  source = UPGRADES_MAIN,
  stateKey = "upgrades",
  { runOnBuy = true } = {}
) {
  const upgrade = getUpgradeDefinition(upgradeId, source);
  if (!upgrade) return false;

  const maxLevel = getUpgradeMaxLevel(state, upgrade, stateKey);
  const clampedTargetLevel = Math.max(0, Math.min(targetLevel, maxLevel));
  const currentLevel = getUpgradeLevel(state, upgradeId, stateKey);

  if (!state[stateKey]) state[stateKey] = {};

  if (clampedTargetLevel <= currentLevel) return false;

  state[stateKey][upgradeId] = clampedTargetLevel;

  // Run onBuy once for each granted level if requested
  if (runOnBuy && typeof upgrade.onBuy === "function") {
    for (let level = currentLevel + 1; level <= clampedTargetLevel; level++) {
      upgrade.onBuy(state, level);
    }
  }

  return true;
}

export function MULT050002Multiplier(state) {
  return toBigNum(Math.max(1, (Date.now() - (state.stats.castStartTime ?? Date.now())) / 5000));
}

export function MULT050100Multiplier(state) {
  return toBigNum(multiplyBigNum(safeLog10BigNum(state.currencies.patterns), powerBigNum(state.currencies.patterns, 1/3)));
}