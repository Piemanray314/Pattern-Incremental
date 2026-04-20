import { UPGRADES_MAIN } from "../data/upgradesMain.js";
import { compareBigNum, subtractBigNum, toBigNum, addBigNum, multiplyBigNumByNumber, oneBigNum, zeroBigNum, roundMultiplierBigNum } from "../utils/bigNum.js";

// Current state keys are "upgrades" and "automationUpgrades"

// Returns all upgrade logic roll effects
// rollData is passed for future flexibility, even if some effects do not use it yet
export function getUpgradeConfig(state, rollData) {
  return {
    preMultiplierFlatBonus: getPreMultiplierFlatBonus(state, rollData),
    globalMultiplier: getGlobalMultiplier(state, rollData),
    postMultiplierFlatBonus: getPostMultiplierFlatBonus(state, rollData)
  };
}

// Flat value added before multipliers.
export function getPreMultiplierFlatBonus(state, rollData) {
  let bonus = zeroBigNum();

  bonus = addBigNum(
    bonus,
    multiplyBigNumByNumber(oneBigNum(), 250 * getUpgradeLevel(state, "MULT030401"))
  );

  bonus = addBigNum(
    bonus,
    multiplyBigNumByNumber(oneBigNum(), 1250 * getUpgradeLevel(state, "MULT030402"))
  );

  return bonus;
}

// Global multiplier applied after pattern multipliers.
export function getGlobalMultiplier(state, rollData) {
  let multiplier = oneBigNum();

  multiplier = addBigNum(
    multiplier,
    multiplyBigNumByNumber(oneBigNum(), 0.2 * getUpgradeLevel(state, "MULT030301"))
  );

  return roundMultiplierBigNum(multiplier);
}

// Flat value added after all multipliers.
export function getPostMultiplierFlatBonus(state, rollData) {
  let bonus = zeroBigNum();

  bonus = addBigNum(
    bonus,
    multiplyBigNumByNumber(oneBigNum(), 10000 * getUpgradeLevel(state, "MULT030403"))
  );

  bonus = addBigNum(
    bonus,
    multiplyBigNumByNumber(oneBigNum(), 50000 * getUpgradeLevel(state, "MULT030404"))
  );

  return bonus;
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
  const maxLevel = upgrade.maxLevel ?? 1;

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