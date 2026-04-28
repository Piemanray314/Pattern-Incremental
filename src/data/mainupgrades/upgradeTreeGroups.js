import { UPGRADES_MAIN } from "./upgradesMain.js";
import { UPGRADES_MAIN_4 } from "./upgradesMain4.js";
import { UPGRADES_MAIN_5 } from "./upgradesMain5.js";
import { hasUpgrade } from "../../core/helpers/upgradeHelpers.js";
import { UPGRADES_MAIN_6 } from "./upgradesMain6.js";
import { UPGRADES_MAIN_7 } from "./upgradesMain7.js";
import { UPGRADES_MAIN_8 } from "./upgradesMain8.js";
import { UPGRADES_MAIN_9 } from "./upgradesMain9.js";
import { UPGRADES_MAIN_10 } from "./upgradesMain10.js";

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
  },
  {
    id: "digits7",
    label: "Polynomial Tier",
    definitions: UPGRADES_MAIN_7,
    stateKey: "upgrades",
    viewStateKey: "upgradeTreeView_7",
    visibleWhen: (state) => hasUpgrade(state, "UNL069999")
  },
  {
    id: "digits8",
    label: "Exponenetial Tier",
    definitions: UPGRADES_MAIN_8,
    stateKey: "upgrades",
    viewStateKey: "upgradeTreeView_8",
    visibleWhen: (state) => hasUpgrade(state, "UNL079999")
  },
  {
    id: "digits9",
    label: "Factorial Tier",
    definitions: UPGRADES_MAIN_9,
    stateKey: "upgrades",
    viewStateKey: "upgradeTreeView_9",
    visibleWhen: (state) => hasUpgrade(state, "UNL089999")
  },
  {
    id: "digits10",
    label: "Ackermann Tier",
    definitions: UPGRADES_MAIN_10,
    stateKey: "upgrades",
    viewStateKey: "upgradeTreeView_10",
    visibleWhen: (state) => hasUpgrade(state, "UNL099999")
  }
];


  
