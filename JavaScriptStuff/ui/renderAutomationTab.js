import { AUTOMATION_UPGRADES } from "../data/automationUpgradesMain.js";
import { renderTreeView } from "./renderTreeView.js";

export function renderAutomationTab(state, setState) {
  return renderTreeView({
    state,
    setState,
    title: "Automation Tree",
    definitions: AUTOMATION_UPGRADES,
    stateKey: "automationUpgrades",
    viewStateKey: "automationTreeView"
  });
}