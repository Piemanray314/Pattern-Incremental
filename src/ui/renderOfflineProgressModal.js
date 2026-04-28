import { createElement } from "../utils/dom.js";
import { formatElapsedTime, formatNumber } from "../utils/format.js";
import { getOfflineProgressChanges, skipAllOfflineProgress, skipOfflineProgressPercent, closeOfflineProgress } from "../core/helpers/offlineProgressHelpers.js";

export function renderOfflineProgressModal(state, setState) {
  const offline = state.ui.offlineProgress;
  if (!offline?.active) return null;

  const overlay = createElement("div", { className: "modal-overlay" });
  const modal = createElement("div", { className: "modal-panel offline-progress-modal" });

  // Offline calculation only closes when complete (meaning no clicking out of it)

  if (offline.complete) {
    renderOfflineComplete(modal, state, setState);
  } else {
    renderOfflineCalculating(modal, state, setState);
  }

  overlay.append(modal);
  return overlay;
}

// What modal shows when calculating
function renderOfflineCalculating(modal, state, setState) {
  const offline = state.ui.offlineProgress;
  const percent = offline.totalTicks > 0
    ? Math.floor((offline.ticksDone / offline.totalTicks) * 100)
    : 100;

  modal.append(
    createElement("h2", { className: "panel-title", text: "Offline Progress Calculation" }),
    createElement("div", {
      className: "muted",
      text: `${offline.ticksDone} ticks / ${offline.totalTicks} total`
    }),
    createElement("div", {
      text: `${percent}% complete`
    }),
    createElement("div", {
      className: "muted",
      text: `Tick length: ${formatElapsedTime(offline.tickMs)}`
    }),
    createElement("div", { className: "section-spacer" })
  );

  const actions = createElement("div", { className: "roll-actions" });

  actions.append(
    createElement("button", {
      text: "Skip 10%",
      onClick: () => {
        setState((draft) => {
          skipOfflineProgressPercent(draft, 0.1);
        }, { topbar: true, content: false, sidebar: false });
      }
    }),
    createElement("button", {
      text: "Skip All",
      onClick: () => {
        setState((draft) => {
          skipAllOfflineProgress(draft);
        }, { topbar: true, content: false, sidebar: false });
      }
    })
  );

  modal.append(actions);
}

// What modal shows for results
function renderOfflineComplete(modal, state, setState) {
  const offline = state.ui.offlineProgress;
  const changes = getOfflineProgressChanges(offline.before, offline.after);

  modal.append(
    createElement("h2", { className: "panel-title", text: "Offline Progress Complete" }),
    createElement("div", {
      text: `${offline.calculatedRolls} rolls calculated over ${formatElapsedTime(offline.elapsedMs)}.`
    }),
    createElement("div", { className: "section-spacer" })
  );

  if (changes.length === 0) {
    modal.append(createElement("div", { className: "muted", text: "No resources changed." }));
  } else {
    const list = createElement("div", { className: "stats-list" });

    for (const change of changes) {
      list.append(
        createElement("div", {
          className: "stat-row",
          text: `${change.label}: ${formatNumber(change.before)} -> ${formatNumber(change.after)}`
        })
      );
    }

    modal.append(list);
  }

  modal.append(createElement("div", { className: "section-spacer" }));

  modal.append(
    createElement("button", {
      text: "Close",
      onClick: () => {
        setState((draft) => {
          closeOfflineProgress(draft);
        }, { topbar: true, content: true, sidebar: false });
      }
    })
  );
}