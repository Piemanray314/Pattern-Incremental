import { AUTOMATION_UPGRADES } from "./automationUpgradesMain.js";

export const AUTOMATION_TREE_GROUPS = [
  {
    id: "main",
    label: "Automation",
    definitions: AUTOMATION_UPGRADES,
    stateKey: "automationUpgrades",
    viewStateKey: "automationTreeView_main",
    visibleWhen: () => true
  }
];