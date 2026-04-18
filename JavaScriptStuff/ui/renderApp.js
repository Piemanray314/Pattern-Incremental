import { TAB_IDS } from "./tabs.js";
import { renderTopbar } from "./renderTopbar.js";
import { renderRollTab } from "./renderRollTab.js";
import { renderUpgradesTab } from "./renderUpgradesTab.js";
import { renderAutomationTab } from "./renderAutomationTab.js";
import { renderPatternsTab } from "./renderPatternsTab.js";
import { renderStatsTab } from "./renderStatsTab.js";
import { renderBestRollsTab } from "./renderBestRollsTab.js";
import { renderSettingsTab } from "./renderSettingsTab.js";
import { createElement } from "../utils/dom.js";

let shell = null;

export function initializeAppShell(state, setState) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const topbarHost = createElement("div");
  const mainLayout = createElement("div", { className: "main-layout" });
  const sidebar = createElement("aside", { className: "sidebar" });
  const content = createElement("main", { className: "content" });

  const sidebarButtons = new Map();

  for (const tab of TAB_IDS) {
    const button = createElement("button", {
      className: "sidebar-tab",
      text: tab.label,
      onClick: () => {
        if (state.ui.activeTab === tab.id) return;

        setState((draft) => {
          draft.ui.activeTab = tab.id;
        }, { topbar: false, content: true, sidebar: true });
      }
    });

    sidebarButtons.set(tab.id, button);
    sidebar.append(button);
  }

  mainLayout.append(sidebar, content);
  app.append(topbarHost, mainLayout);

  shell = {
    app,
    topbarHost,
    sidebar,
    content,
    sidebarButtons
  };

  renderTopbarInto(state, setState);
  renderContentInto(state, setState);
  refreshSidebarActiveState(state);
}

export function renderTopbarInto(state, setState) {
  ensureShellExists();
  shell.topbarHost.innerHTML = "";
  shell.topbarHost.append(renderTopbar(state, setState));
}

export function renderContentInto(state, setState) {
  ensureShellExists();
  shell.content.innerHTML = "";

  switch (state.ui.activeTab) {
    case "roll":
      shell.content.append(renderRollTab(state, setState));
      break;
    case "upgrades":
      shell.content.append(renderUpgradesTab(state, setState));
      break;
    case "automation":
      shell.content.append(renderAutomationTab(state, setState));
      break;
    case "patterns":
      shell.content.append(renderPatternsTab(state, setState));
      break;
    case "stats":
      shell.content.append(renderStatsTab(state));
      break;
    case "bestRolls":
      shell.content.append(renderBestRollsTab(state, setState));
      break;
    case "settings":
      shell.content.append(renderSettingsTab(state, setState));
      break;
    default:
      shell.content.append(renderRollTab(state, setState));
      break;
  }
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
