import { makeUpgradeDefinition, makeUpgradePatternDefinition } from "../../core/helpers/definitionHelpers.js";
import { hasUpgrade, MULT050002Multiplier, MULT050100Multiplier } from "../../core/helpers/upgradeHelpers.js";
import { compareBigNum, fromNumber, toBigNum, powerBigNum, multiplyBigNum } from "../../utils/bigNum.js";
import { grantPreviousTierUpgrades } from "../../core/helpers/castingUpgradeHelpers.js";
import { grantPrecisionRecastRoutingUpgrade } from "../../core/helpers/precisionRecastHelpers.js";
import { formatMultiplier } from "../../utils/format.js";

// For specifications regarding upgrade format, refer to upgradesMain.js

// List of all upgrades in the main upgrade tree tab 7, 9-digit upgrades
export const UPGRADES_MAIN_9 = [
  {
    id: "DIG09",
    title: "Unlock 9 Digits",
    description: "Allows rolling 9-digit numbers",
    cost: { points: 9 },
    maxLevel: 1,
    x: 0,
    y: 0,
    parents: [],
    visibleWhen: (state) => true,
    canBuyWhen: (state) => hasUpgrade(state, "DIG08"),
    onBuy(state) {
      state.progression.maxDigitsUnlocked = Math.max(
        state.progression.maxDigitsUnlocked, 9
      );
      grantPrecisionRecastRoutingUpgrade(state, 9);
      if(hasUpgrade(state, "PRES00006", "castingUpgrades")) {
        grantPreviousTierUpgrades(state, "max");
      } else if (hasUpgrade(state, "PRES00005", "castingUpgrades")){
        grantPreviousTierUpgrades(state, "Only a singular level for you plebians who can't afford the higher level muahaha");
      }
    }
  }
];
