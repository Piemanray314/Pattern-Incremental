import { createInitialState } from "./state/initialState.js";
import { loadGame, saveGame } from "./state/save.js";
import { updateGame } from "./core/gameLoop.js";
import { initializeAppShell, renderTopbarInto, renderContentInto, refreshSidebarActiveState, renderModalInto, renderSidebarInto, refreshActiveEffectTexts, refreshTopbarLiveContent } from "./ui/renderApp.js";
import { setNumberFormatMode } from "./utils/format.js";
import { deserializeSave, serializeSave } from "./state/saveCodec.js";
import { refreshUpgradeEffectTexts } from "./ui/renderTreeView.js";
import { getOfflineElapsedMs, beginOfflineProgress, runOfflineProgressBatch, MIN_OFFLINE_MS } from "./core/helpers/offlineProgressHelpers.js";

let saveLoadFailed = false;

let state = loadGame();

if (!state) {
  saveLoadFailed = Boolean(localStorage.getItem("pattern_incremental_save"));
  state = createInitialState();
}

setNumberFormatMode(state.settings.numberFormatMode);

const offlineElapsedMs = getOfflineElapsedMs(state);
console.log("lastSavedAt", state.meta.lastSavedAt);
console.log("now", Date.now());
console.log("offlineElapsedMs", offlineElapsedMs);

initializeAppShell(state, setState);

if (offlineElapsedMs >= MIN_OFFLINE_MS) {
  setState((draft) => {
    beginOfflineProgress(draft, offlineElapsedMs);
  }, { topbar: true, content: false, sidebar: false });

  requestAnimationFrame(runOfflineLoop);
}

let lastFrameRealTimeMs = Date.now();
let hiddenStartedRealTimeMs = null;

async function runOfflineLoop() {
  if (!state.ui.offlineProgress?.active || state.ui.offlineProgress.complete) {
    renderModalInto(state, setState);
    return;
  }

  const complete = await runOfflineProgressBatch(state);

  renderTopbarInto(state, setState);
  renderModalInto(state, setState);

  if (!complete) {
    requestAnimationFrame(runOfflineLoop);
  } else {
    renderModalInto(state, setState);
    saveGame(state);
  }
}

function setState(mutator, renderOptions = {}) {
  const {
    topbar = true,
    content = true,
    sidebar = false,
    effectText = false
  } = renderOptions;

  mutator(state);
  setNumberFormatMode(state.settings.numberFormatMode);

  if (topbar) {
    renderTopbarInto(state, setState);
  }

  if (content) {
    renderContentInto(state, setState);
  }

  if (sidebar) {
    renderSidebarInto(state, setState);
  }

  renderModalInto(state, setState);
}

function tick() {
  if (document.hidden) {
    if (hiddenStartedRealTimeMs === null) {
      hiddenStartedRealTimeMs = Date.now();
    }
    requestAnimationFrame(tick);
    return;
  }

  // Piemanray314 [Devmode, 5x speed]
  const devMode = false;
  const nowRealTimeMs = Date.now();
  const deltaMs = devMode ? 5 * Math.max(0, nowRealTimeMs - lastFrameRealTimeMs) :  Math.max(0, nowRealTimeMs - lastFrameRealTimeMs);
  lastFrameRealTimeMs = nowRealTimeMs;

  if (state.ui.offlineProgress?.active && !state.ui.offlineProgress.complete) {
    requestAnimationFrame(tick);
    return;
  }

  if (deltaMs >= MIN_OFFLINE_MS) {
    setState((draft) => {
      beginOfflineProgress(draft, deltaMs);
    }, { topbar: true, content: false, sidebar: false });

    requestAnimationFrame(runOfflineLoop);
    requestAnimationFrame(tick);
    return;
  }

  const renderInstructions = updateGame(state, deltaMs);
  setNumberFormatMode(state.settings.numberFormatMode);

  if (renderInstructions.topbar) {
    renderTopbarInto(state, setState);
  }

  if (renderInstructions.topbarLive) {
    refreshTopbarLiveContent(state);
  }

  if (renderInstructions.content) {
    renderContentInto(state, setState);
  }

  if (renderInstructions.sidebar) {
    refreshSidebarActiveState(state);
  }

  if (renderInstructions.effectText) {
    refreshActiveEffectTexts(state);
  }

  requestAnimationFrame(tick);
}

window.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    hiddenStartedRealTimeMs = Date.now();
    return;
  }

  const nowRealTimeMs = Date.now();
  const hiddenElapsedMs = hiddenStartedRealTimeMs === null
    ? Math.max(0, nowRealTimeMs - lastFrameRealTimeMs)
    : Math.max(0, nowRealTimeMs - hiddenStartedRealTimeMs);

  hiddenStartedRealTimeMs = null;
  lastFrameRealTimeMs = nowRealTimeMs;

  if (state.ui.offlineProgress?.active && !state.ui.offlineProgress.complete) {
    return;
  }

  if (hiddenElapsedMs >= MIN_OFFLINE_MS) {
    setState((draft) => {
      beginOfflineProgress(draft, hiddenElapsedMs);
    }, { topbar: true, content: false, sidebar: false });

    requestAnimationFrame(runOfflineLoop);
  }
});

setInterval(() => {
  if (saveLoadFailed) return;
  if (document.hidden) return;
  saveGame(state);
}, 15000);

window.addEventListener("beforeunload", () => {
  if (saveLoadFailed || window.skipNextAutosave) return;
  saveGame(state);
});

requestAnimationFrame(tick);
