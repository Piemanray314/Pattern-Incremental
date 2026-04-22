import { createElement } from "../utils/dom.js";
import { renderTreeView } from "./renderTreeView.js";
import { saveSubtab } from "../state/uiState.js";
import { CASTING_TREE_GROUPS } from "../data/castingTreeGroups.js";
import { canCast, getCastingRewards, performCast, getCurrentCastProgress } from "../core/castingHelpers.js";
import { formatNumber } from "../utils/format.js";

let recastSummaryHost = null;

// Main renderer for the Casting tab.
// Handles the Recast page plus future tree subtabs.
export function renderCastingTab(state, setState) {
  const fragment = document.createDocumentFragment();

  const visibleSubtabs = [
    { id: "recast", label: "Recast", type: "page", visibleWhen: () => true },
    ...CASTING_TREE_GROUPS.map((group) => ({
      id: group.id,
      label: group.label,
      type: "tree",
      visibleWhen: group.visibleWhen,
      group
    }))
  ].filter((tab) => tab.visibleWhen(state));

  const activeId = visibleSubtabs.some((tab) => tab.id === state.ui.castingSubtab)
    ? state.ui.castingSubtab
    : visibleSubtabs[0]?.id;

  const activeTab = visibleSubtabs.find((tab) => tab.id === activeId);

  const subtabBar = createElement("div", { className: "roll-actions" });

  for (const tab of visibleSubtabs) {
    const button = createElement("button", {
      text: tab.label,
      onClick: () => {
        setState((draft) => {
          draft.ui.castingSubtab = tab.id;
        }, { topbar: false, content: true, sidebar: false });

        saveSubtab("castingSubtab", tab.id);
      }
    });

    if (tab.id === activeId) {
      button.style.borderColor = "var(--accent)";
    }

    subtabBar.append(button);
  }

  fragment.append(subtabBar);
  fragment.append(createElement("div", { className: "section-spacer" }));

  if (!activeTab) {
    fragment.append(
      createElement("section", { className: "panel" },
      )
    );
    return fragment;
  }

  if (activeTab.id === "recast") {
    fragment.append(renderRecastPage(state, setState));
    return fragment;
  }

  // If we are not on the Recast page, do not keep a stale summary host reference.
  recastSummaryHost = null;

  fragment.append(
    renderTreeView({
      state,
      setState,
      title: activeTab.label,
      definitions: activeTab.group.definitions,
      stateKey: activeTab.group.stateKey,
      viewStateKey: activeTab.group.viewStateKey
    })
  );

  return fragment;
}

// Renders the main Recast page.
// The summary text is kept in its own host so it can be refreshed without rebuilding the button.
function renderRecastPage(state, setState) {
  const panel = createElement("section", { className: "panel" });

  const summaryHost = createElement("div");
  recastSummaryHost = summaryHost;
  renderRecastSummaryInto(summaryHost, state);

  panel.append(summaryHost);
  panel.append(createElement("div", { className: "section-spacer" }));

  const castButton = createElement("button", {
    text: "Perform Recast",
    onClick: () => {
      if (!canCast(state)) {
        window.alert("You are not ready to recast yet.");
        return;
      }

      const confirmed = window.confirm("Perform a recast? This will reset most base progress.");
      if (!confirmed) return;

      setState((draft) => {
        performCast(draft);
      }, { topbar: true, content: true, sidebar: true });
    }
  });

  castButton.style.marginTop = "16px";
  panel.append(castButton);

  return panel;
}

// Updates only the live Recast summary text.
// This avoids recreating the button every time values change.
function renderRecastSummaryInto(host, state) {
  host.innerHTML = "";

  const progress = getCurrentCastProgress(state);
  const rewards = getCastingRewards(state);
  
  if(canCast(state)) {
    host.append(
      createElement("h2", { className: "panel-title", text: "Recast" }),
      createElement("div", {
        text:
          `Ray's Number Game (RNG) is impressed with your progress this cast. ` +
          `You have accumulated ${formatNumber(progress.points)} points and ` +
          `${formatNumber(progress.patterns)} patterns over ` +
          `${formatNumber(progress.rolls)} rolls.`
      }),
      createElement("div", { className: "section-spacer" }),
      createElement("div", {
        className: "muted",
        text:
          `Recasting resets most pre-cast progress in exchange for new upgreades, casts, and shards. Gain is dependent on your total accumulated number of points and patterns. `
      }),
      createElement("div", { className: "section-spacer" }),
      createElement("div", {
        className: "muted",
        text:
          `Current reward: ${formatNumber(rewards.casts)} Casts, ` +
          `${formatNumber(rewards.shards)} Shards.`
      })
    );
  } else {
    host.append(
      createElement("h2", { className: "panel-title", text: "Recast" }),
      createElement("div", {
        text:
          `Ray's Number Game (RNG) is not impressed with your progress this cast. You may not recast yet.`
    }));
  }
}

// Refreshes only the live summary section of the Recast page.
// Safe to call repeatedly during automation updates.
export function refreshCastingTabLiveContent(state) {
  if (!recastSummaryHost) return;
  renderRecastSummaryInto(recastSummaryHost, state);
}