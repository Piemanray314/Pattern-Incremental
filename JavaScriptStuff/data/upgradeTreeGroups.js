import { UPGRADES_MAIN } from "./upgradesMain.js";
import { UPGRADES_MAIN_4 } from "./upgradesMain4.js";
import { hasUpgrade } from "../core/upgradeHelpers.js";

// For tiers, maybe something like:
// Constant -> Logarithmic -> Linear -> Linearithmic -> Polynomial ->
// Exponenetial -> Factorial -> Tetration -> Ackermann -> Something ridiculous

// Main upgrade tree groups (top tabs)
export const UPGRADE_TREE_GROUPS = [
  {
    id: "main",
    label: "Constant Tier",
    definitions: UPGRADES_MAIN,
    stateKey: "upgrades",
    viewStateKey: "upgradeTreeView_main",
    visibleWhen: () => true
  },
  {
    id: "digits4",
    label: "Logarithmic Tier",
    definitions: UPGRADES_MAIN_4,
    stateKey: "upgrades",
    viewStateKey: "upgradeTreeView_4",
    visibleWhen: (state) => hasUpgrade(state, "UNL039999")
  },
];

/*
  {
    id: "digits5",
    label: "5-Digit",
    definitions: UPGRADES_DIGIT_5,
    stateKey: "upgrades",
    viewStateKey: "upgradeTreeView_5",
    visibleWhen: (state) => hasUpgrade(state, "UNL050000")
  }
*/