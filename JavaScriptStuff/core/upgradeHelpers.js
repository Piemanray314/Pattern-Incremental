import { UPGRADES } from "../data/upgrades.js";
import { compareBigNum, subtractBigNum, toBigNum } from "../utils/bigNum.js";

export function getUpgradeLevel(state, upgradeId, stateKey = "upgrades") {
  return state[stateKey]?.[upgradeId] ?? 0;
}

export function hasUpgrade(state, upgradeId, stateKey = "upgrades") {
  return getUpgradeLevel(state, upgradeId, stateKey) > 0;
}

export function hasAllUpgrades(state, upgradeIds, stateKey = "upgrades") {
  return upgradeIds.every((id) => hasUpgrade(state, id, stateKey));
}

export function hasAnyUpgrade(state, upgradeIds, stateKey = "upgrades") {
  return upgradeIds.some((id) => hasUpgrade(state, id, stateKey));
}

export function getUpgradeDefinition(upgradeId, source = UPGRADES) {
  return source.find((item) => item.id === upgradeId) ?? null;
}

export function getUpgradeCost(state, upgrade) {
  const currentLevel = getUpgradeLevel(state, upgrade.id, upgrade.stateKey ?? "upgrades");
  const costDef = upgrade.cost;

  if (typeof costDef === "function") {
    return normalizeCostObject(costDef(currentLevel, state));
  }

  if (Array.isArray(costDef)) {
    return normalizeCostObject(costDef[currentLevel] ?? null);
  }

  return normalizeCostObject(costDef);
}

export function normalizeCostObject(cost) {
  if (!cost) return null;

  const normalized = {};
  for (const [currency, amount] of Object.entries(cost)) {
    normalized[currency] = toBigNum(amount);
  }
  return normalized;
}

export function canAffordCost(state, cost) {
  if (!cost) return false;

  return Object.entries(cost).every(([currency, amount]) => {
    return compareBigNum(state.currencies[currency] ?? 0, amount) >= 0;
  });
}

export function payCost(state, cost) {
  for (const [currency, amount] of Object.entries(cost)) {
    state.currencies[currency] = subtractBigNum(
      state.currencies[currency] ?? 0,
      amount
    );
  }
}

export function buyUpgrade(
  state,
  upgradeId,
  source = UPGRADES,
  stateKey = "upgrades"
) {
  const upgrade = getUpgradeDefinition(upgradeId, source);
  if (!upgrade) return false;

  const currentLevel = getUpgradeLevel(state, upgradeId, stateKey);
  const maxLevel = upgrade.maxLevel ?? 1;

  if (currentLevel >= maxLevel) return false;
  if (!upgrade.visibleWhen(state)) return false;
  if (!upgrade.canBuyWhen(state)) return false;

  const cost = getUpgradeCost(state, upgrade);
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