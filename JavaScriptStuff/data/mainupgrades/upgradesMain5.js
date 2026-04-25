import { makeUpgradeDefinition, makeUpgradePatternDefinition } from "../../core/helpers/definitionHelpers.js";
import { hasUpgrade } from "../../core/helpers/upgradeHelpers.js";
import { compareBigNum, fromNumber, toBigNum, powerBigNum, multiplyBigNum } from "../../utils/bigNum.js";

// For specifications regarding upgrade format, refer to upgradesMain.js

// List of all upgrades in the main upgrade tree tab 2, 4-digit upgrades
export const UPGRADES_MAIN_5 = [
  {
    id: "DIG05",
    title: "Unlock 5 Digits",
    description: "Allows rolling 5-digit numbers",
    cost: { points: 5 },
    maxLevel: 1,
    x: 0,
    y: 0,
    parents: [],
    visibleWhen: (state) => true,
    canBuyWhen: (state) => hasUpgrade(state, "DIG04"),
    onBuy(state) {
      state.progression.maxDigitsUnlocked = Math.max(
        state.progression.maxDigitsUnlocked, 5
      );
    }
  }
];