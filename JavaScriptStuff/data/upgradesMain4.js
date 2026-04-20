import { makeUpgradeDefinition } from "../core/definitionHelpers.js";
import { hasUpgrade } from "../core/upgradeHelpers.js";
import { compareBigNum, fromNumber, toBigNum } from "../utils/bigNum.js";

// Returns if the player has earned at least the given lifetime point total.
export function hasAtLeastPointsEarned(state, amount) {
  return compareBigNum(toBigNum(state.stats.lifetimePointsGained), fromNumber(amount)) >= 0;
}

// For specifications regarding upgrade format, refer to upgradesMain.js

// List of all upgrades in the main upgrade tree tab 2, 4-digit upgrades
export const UPGRADES_MAIN_4 = [
  {
    id: "DIG04",
    title: "Unlock 4 Digits",
    description: "Allows rolling 4-digit numbers.",
    cost: { points: 20000 },
    maxLevel: 1,
    x: 0,
    y: 0,
    parents: [],
    visibleWhen: (state) => hasUpgrade(state, "DIG02"),
    canBuyWhen: (state) => hasUpgrade(state, "DIG02"),
    onBuy(state) {
      state.progression.maxDigitsUnlocked = Math.max(
        state.progression.maxDigitsUnlocked,
        4
      );
    }
  }
];