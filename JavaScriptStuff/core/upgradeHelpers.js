import { UPGRADES } from "../data/upgrades.js";

export function getUpgradeLevel(state, upgradeId) {
  return state.upgrades[upgradeId] ?? 0;
}

export function hasUpgrade(state, upgradeId) {
  return getUpgradeLevel(state, upgradeId) > 0;
}

export function hasAllUpgrades(state, upgradeIds) {
  return upgradeIds.every((id) => hasUpgrade(state, id));
}

export function hasAnyUpgrade(state, upgradeIds) {
  return upgradeIds.some((id) => hasUpgrade(state, id));
}

export function getUpgradeDefinition(upgradeId) {
  return UPGRADES.find((item) => item.id === upgradeId) ?? null;
}

export function getUpgradeCost(state, upgrade) {
  const currentLevel = getUpgradeLevel(state, upgrade.id);
  const costDef = upgrade.cost;

  if (typeof costDef === "function") {
    return costDef(currentLevel, state);
  }

  if (Array.isArray(costDef)) {
    return costDef[currentLevel] ?? null;
  }

  return costDef;
}

export function canAffordCost(state, cost) {
  if (!cost) return false;

  return Object.entries(cost).every(([currency, amount]) => {
    return (state.currencies[currency] ?? 0) >= amount;
  });
}

export function payCost(state, cost) {
  for (const [currency, amount] of Object.entries(cost)) {
    state.currencies[currency] -= amount;
  }
}

export function buyUpgrade(state, upgradeId) {
  const upgrade = getUpgradeDefinition(upgradeId);
  if (!upgrade) return false;

  const currentLevel = getUpgradeLevel(state, upgradeId);
  const maxLevel = upgrade.maxLevel ?? 1;

  if (currentLevel >= maxLevel) return false;
  if (!upgrade.visibleWhen(state)) return false;
  if (!upgrade.canBuyWhen(state)) return false;

  const cost = getUpgradeCost(state, upgrade);
  if (!cost) return false;
  if (!canAffordCost(state, cost)) return false;

  payCost(state, cost);
  state.upgrades[upgradeId] = currentLevel + 1;

  if (typeof upgrade.onBuy === "function") {
    upgrade.onBuy(state, state.upgrades[upgradeId]);
  }

  return true;
}