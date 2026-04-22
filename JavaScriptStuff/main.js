import { createInitialState } from "./state/initialState.js";
import { loadGame, saveGame } from "./state/save.js";
import { updateGame } from "./core/gameLoop.js";
import { initializeAppShell, renderTopbarInto, renderContentInto, refreshSidebarActiveState, renderModalInto, renderSidebarInto, refreshActiveTabLiveContent } from "./ui/renderApp.js";
import { setNumberFormatMode } from "./utils/format.js";

let state = loadGame() ?? createInitialState();
setNumberFormatMode(state.settings.numberFormatMode);

let lastFrameTime = performance.now();

initializeAppShell(state, setState);

function setState(mutator, renderOptions = {}) {
  const {
    topbar = true,
    content = true,
    sidebar = false
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

  if (state.ui.activeTab === "casting") {
    refreshActiveTabLiveContent(state);
  }

  requestAnimationFrame(tick);
}

setInterval(() => {
  saveGame(state);
}, 5000);

window.addEventListener("beforeunload", () => {
  saveGame(state);
});

requestAnimationFrame(tick);