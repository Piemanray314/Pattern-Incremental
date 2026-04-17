import { TAB_IDS } from "./tabs.js";
import { renderTopbar } from "./renderTopbar.js";
import { renderRollTab } from "./renderRollTab.js";
import { renderUpgradesTab } from "./renderUpgradesTab.js";
import { renderPatternsTab } from "./renderPatternsTab.js";
import { renderStatsTab } from "./renderStatsTab.js";
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

  if (state.ui.activeTab === "roll") {
    shell.content.append(renderRollTab(state, setState));
  } else if (state.ui.activeTab === "upgrades") {
    shell.content.append(renderUpgradesTab(state, setState));
  } else if (state.ui.activeTab === "patterns") {
    shell.content.append(renderPatternsTab(state, setState));
  } else if (state.ui.activeTab === "stats") {
    shell.content.append(renderStatsTab(state));
  } else if (state.ui.activeTab === "settings") {
    shell.content.append(renderSettingsTab(state, setState));
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