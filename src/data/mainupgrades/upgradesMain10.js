import { makeUpgradeDefinition, makeUpgradePatternDefinition } from "../../core/helpers/definitionHelpers.js";
import { hasUpgrade, MULT050002Multiplier, MULT050100Multiplier } from "../../core/helpers/upgradeHelpers.js";
import { compareBigNum, fromNumber, toBigNum, powerBigNum, multiplyBigNum } from "../../utils/bigNum.js";
import { grantPreviousTierUpgrades } from "../../core/helpers/castingUpgradeHelpers.js";
import { grantPrecisionRecastRoutingUpgrade } from "../../core/helpers/precisionRecastHelpers.js";
import { formatMultiplier } from "../../utils/format.js";

// For specifications regarding upgrade format, refer to upgradesMain.js

// List of all upgrades in the main upgrade tree tab 8, 9-digit upgrades
// From here on, there will be no more upgrades to increase digit count, only upgrades for further scaling
export const UPGRADES_MAIN_10 = [
];
