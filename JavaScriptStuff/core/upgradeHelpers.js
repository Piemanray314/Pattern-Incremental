import { UPGRADES } from "../data/upgrades.js";
import { compareBigNum, isBigNum, subtractBigNum, toBigNum } from "../utils/bigNum.js";

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

export function getUpgradeDefinition(upgradeId, definitions = UPGRADES) {
  return definitions.find((item) => item.id === upgradeId) ?? null;
}

export function getUpgradeCost(state, upgrade) {
  const currentLevel = getUpgradeLevel(state, upgrade.id, upgrade.stateKey ?? "upgrades");
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
    const balance = state.currencies[currency] ?? 0;

    if (isBigNum(balance) || isBigNum(amount)) {
      return compareBigNum(toBigNum(balance), toBigNum(amount)) >= 0;
    }

    return balance >= amount;
  });
}

export function payCost(state, cost) {
  for (const [currency, amount] of Object.entries(cost)) {
    const balance = state.currencies[currency] ?? 0;

    if (isBigNum(balance) || isBigNum(amount)) {
      state.currencies[currency] = subtractBigNum(toBigNum(balance), toBigNum(amount));
    } else {
      state.currencies[currency] -= amount;
    }
  }
}

export function buyUpgrade(state, upgradeId, definitions = UPGRADES, stateKey = "upgrades") {
  const upgrade = getUpgradeDefinition(upgradeId, definitions);
  if (!upgrade) return false;

  const currentLevel = getUpgradeLevel(state, upgradeId, stateKey);
  const maxLevel = upgrade.maxLevel ?? 1;

  if (currentLevel >= maxLevel) return false;
  if (!upgrade.visibleWhen(state)) return false;
  if (!upgrade.canBuyWhen(state)) return false;

  const cost = getUpgradeCost(state, { ...upgrade, stateKey });
  if (!cost) return false;
  if (!canAffordCost(state, cost)) return false;

  payCost(state, cost);
  state[stateKey] ??= {};
  state[stateKey][upgradeId] = currentLevel + 1;

  if (typeof upgrade.onBuy === "function") {
    upgrade.onBuy(state, state[stateKey][upgradeId]);
  }

  return true;
}

