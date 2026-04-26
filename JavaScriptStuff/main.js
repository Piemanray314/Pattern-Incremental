import { createInitialState } from "./state/initialState.js";
import { loadGame, saveGame } from "./state/save.js";
import { updateGame } from "./core/gameLoop.js";
import { initializeAppShell, renderTopbarInto, renderContentInto, refreshSidebarActiveState, renderModalInto, renderSidebarInto, refreshActiveEffectTexts } from "./ui/renderApp.js";
import { setNumberFormatMode } from "./utils/format.js";
import { deserializeSave, serializeSave } from "./state/saveCodec.js";
import { refreshUpgradeEffectTexts } from "./ui/renderTreeView.js";

let saveLoadFailed = false;

let state = loadGame();

if (!state) {
  saveLoadFailed = Boolean(localStorage.getItem("pattern_incremental_save"));
  state = createInitialState();
}

setNumberFormatMode(state.settings.numberFormatMode);

let lastFrameTime = performance.now();

initializeAppShell(state, setState);

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

function tick(now) {
  const deltaMs = Math.max(0, now - lastFrameTime);
  lastFrameTime = now;

  const renderInstructions = updateGame(state, deltaMs);
  setNumberFormatMode(state.settings.numberFormatMode);

  if (renderInstructions.topbar) {
    renderTopbarInto(state, setState);
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

setInterval(() => {
  if (saveLoadFailed) return;
  saveGame(state);
}, 15000);

window.addEventListener("beforeunload", () => {
  if (saveLoadFailed || window.skipNextAutosave) return;
  saveGame(state);
});

requestAnimationFrame(tick);