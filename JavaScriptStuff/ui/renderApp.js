import { TABS } from "../data/tabs.js";
import { refreshTopbarCurrencies, renderTopbar } from "./renderTopbar.js";
import { renderRollTab } from "./tabs/renderRollTab.js";
import { renderUpgradesTab } from "./tabs/renderUpgradesTab.js";
import { renderAutomationTab } from "./tabs/renderAutomationTab.js";
import { renderPatternsTab } from "./tabs/renderPatternsTab.js";
import { renderStatsTab } from "./tabs/renderStatsTab.js";
import { renderBestRollsTab } from "./tabs/renderBestRollsTab.js";
import { renderSettingsTab } from "./tabs/renderSettingsTab.js";
import { createElement } from "../utils/dom.js";
import { renderChangeLogModal } from "./renderChangeLogModal.js";
import { saveActiveTab } from "../state/uiState.js";
import { renderGuideTab } from "./tabs/renderGuideTab.js";
import { renderCastingTab, refreshCastingTabLiveContent } from "./tabs/renderCastingTab.js";
import { refreshUpgradeEffectTexts } from "./renderTreeView.js";
import { UPGRADE_TREE_GROUPS } from "../data/mainupgrades/upgradeTreeGroups.js";
import { AUTOMATION_TREE_GROUPS } from "../data/automationupgrades/automationTreeGroups.js";
import { CASTING_TREE_GROUPS } from "../data/castingupgrades/castingTreeGroups.js";

let shell = null;

export function initializeAppShell(state, setState) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const topbarHost = createElement("div");
  const mainLayout = createElement("div", { className: "main-layout" });
  const sidebar = createElement("aside", { className: "sidebar" });
  const content = createElement("main", { className: "content" });
  const modalHost = createElement("div", { className: "modal-host" });

  const sidebarButtons = new Map();

  const visibleTabs = TABS.filter((tab) => tab.visibleWhen(state));

  for (const tab of visibleTabs) {
    const button = createElement("button", {
      className: "sidebar-tab",
      text: tab.label,
      onClick: () => {
        if (state.ui.activeTab === tab.id) return;

        setState((draft) => {
          draft.ui.activeTab = tab.id;
        }, { topbar: false, content: true, sidebar: true });

        saveActiveTab(tab.id);
      }
    });

    sidebarButtons.set(tab.id, button);
    sidebar.append(button);
  }

  mainLayout.append(sidebar, content);
  app.append(topbarHost, mainLayout, modalHost);

  shell = {
    app,
    topbarHost,
    sidebar,
    content,
    sidebarButtons: new Map(),
    modalHost
  };

  renderTopbarInto(state, setState);
  renderContentInto(state, setState);
  refreshSidebarActiveState(state);
  renderModalInto(state, setState);
  renderSidebarInto(state, setState);
}

export function renderTopbarInto(state, setState) {
  ensureShellExists();
  shell.topbarHost.innerHTML = "";
  shell.topbarHost.append(renderTopbar(state, setState));
}

export function renderModalInto(state, setState) {
  ensureShellExists();
  shell.modalHost.innerHTML = "";

  const modal = renderChangeLogModal(state, setState);
  if (modal) {
    shell.modalHost.append(modal);
  }
}

export function renderContentInto(state, setState) {
  ensureShellExists();
  shell.content.innerHTML = "";

  const visibleTabs = TABS.filter((tab) => tab.visibleWhen(state));
  const activeTabIsVisible = visibleTabs.some((tab) => tab.id === state.ui.activeTab);

  if (!activeTabIsVisible) {
    state.ui.activeTab = visibleTabs[0]?.id ?? "roll";
    saveActiveTab(state.ui.activeTab);
  }

  switch (state.ui.activeTab) {
    case "roll":
      shell.content.append(renderRollTab(state, setState));
      break;
    case "patterns":
      shell.content.append(renderPatternsTab(state, setState));
      break;
    case "upgrades":
      shell.content.append(renderUpgradesTab(state, setState));
      break;
    case "casting":
      shell.content.append(renderCastingTab(state, setState));
      break;
    case "automation":
      shell.content.append(renderAutomationTab(state, setState));
      break;
    case "bestRolls":
      shell.content.append(renderBestRollsTab(state, setState));
      break;
    case "stats":
      shell.content.append(renderStatsTab(state));
      break;
    case "guide":
      shell.content.append(renderGuideTab(state, setState));
      break;
    case "settings":
      shell.content.append(renderSettingsTab(state, setState));
      break;
    default:
      shell.content.append(renderRollTab(state, setState));
      break;
  }
}

export function renderSidebarInto(state, setState) {
  ensureShellExists();
  shell.sidebar.innerHTML = "";
  shell.sidebarButtons = new Map();

  const visibleTabs = TABS.filter((tab) => tab.visibleWhen(state));

  for (const tab of visibleTabs) {
    const button = createElement("button", {
      className: "sidebar-tab",
      text: tab.label,
      onClick: () => {
        if (state.ui.activeTab === tab.id) return;

        setState((draft) => {
          draft.ui.activeTab = tab.id;
        }, { topbar: false, content: true, sidebar: true });

        saveActiveTab(tab.id);
      }
    });

    shell.sidebarButtons.set(tab.id, button);
    shell.sidebar.append(button);
  }

  refreshSidebarActiveState(state);
}

export function refreshSidebarActiveState(state) {
  ensureShellExists();

  for (const [tabId, button] of shell.sidebarButtons.entries()) {
    button.classList.toggle("active", state.ui.activeTab === tabId);
  }
}

function ensureShellExists() {
  if (!shell) {
    throw new Error("App shell has not been initialized yet.");
  }
}

export function refreshActiveEffectTexts(state) {
  if (state.ui.activeTab === "upgrades") {
    const group = UPGRADE_TREE_GROUPS.find(
      (group) => group.id === state.ui.upgradesSubtab
    );

    if (!group) return;

    refreshUpgradeEffectTexts(
      state,
      group.definitions,
      group.stateKey ?? "upgrades"
    );

    return;
  }

  if (state.ui.activeTab === "automation") {
    const group = AUTOMATION_TREE_GROUPS.find(
      (group) => group.id === state.ui.automationSubtab
    );

    if (!group) return;

    refreshUpgradeEffectTexts(
      state,
      group.definitions,
      group.stateKey ?? "automationUpgrades"
    );

    return;
  }

  if (state.ui.activeTab === "casting") {
    const group = CASTING_TREE_GROUPS.find(
      (group) => group.id === state.ui.castingSubtab
    );

    if (!group) return;

    refreshUpgradeEffectTexts(
      state,
      group.definitions,
      group.stateKey ?? "castingUpgrades"
    );
  }
}

export function refreshTopbarLiveContent(state) {
  refreshTopbarCurrencies(state);
}