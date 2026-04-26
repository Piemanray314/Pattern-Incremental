import { UPGRADES_MAIN } from "./upgradesMain.js";
import { UPGRADES_MAIN_4 } from "./upgradesMain4.js";
import { UPGRADES_MAIN_5 } from "./upgradesMain5.js";
import { hasUpgrade } from "../../core/helpers/upgradeHelpers.js";
import { UPGRADES_MAIN_6 } from "./upgradesMain6.js";

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
  {
    id: "digits5",
    label: "Linear Tier",
    definitions: UPGRADES_MAIN_5,
    stateKey: "upgrades",
    viewStateKey: "upgradeTreeView_5",
    visibleWhen: (state) => hasUpgrade(state, "UNL049999")
  },
  {
    id: "digits6",
    label: "Linearithmic Tier",
    definitions: UPGRADES_MAIN_6,
    stateKey: "upgrades",
    viewStateKey: "upgradeTreeView_6",
    visibleWhen: (state) => hasUpgrade(state, "UNL059999")
  }
];


  
