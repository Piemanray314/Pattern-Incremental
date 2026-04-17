import { createInitialState } from "./state/initialState.js";
import { loadGame, saveGame } from "./state/save.js";
import { updateGame } from "./core/gameLoop.js";
import {
  initializeAppShell,
  renderTopbarInto,
  renderContentInto,
  refreshSidebarActiveState
} from "./ui/renderApp.js";

let state = loadGame() ?? createInitialState();
state = hydrateState(state);

let lastFrameTime = performance.now();

initializeAppShell(state, setState);

function setState(mutator, renderOptions = {}) {
  const {
    topbar = true,
    content = true,
    sidebar = false
  } = renderOptions;

  mutator(state);

  if (topbar) {
    renderTopbarInto(state, setState);
  }

  if (content) {
    renderContentInto(state, setState);
  }

  if (sidebar) {
    refreshSidebarActiveState(state);
  }
}

function tick(now) {
  const deltaMs = Math.max(0, now - lastFrameTime);
  lastFrameTime = now;

  const renderInstructions = updateGame(state, deltaMs);

  if (renderInstructions.topbar) {
    renderTopbarInto(state, setState);
  }

  if (renderInstructions.content) {
    renderContentInto(state, setState);
  }

  if (renderInstructions.sidebar) {
    refreshSidebarActiveState(state);
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

function hydrateState(loadedState) {
  const fresh = createInitialState();

  return {
    ...fresh,
    ...loadedState,

    currencies: {
      ...fresh.currencies,
      ...loadedState.currencies
    },

    progression: {
      ...fresh.progression,
      ...loadedState.progression
    },

    upgrades: {
      ...fresh.upgrades,
      ...loadedState.upgrades
    },

    stats: {
      ...fresh.stats,
      ...loadedState.stats
    },

    timers: {
      ...fresh.timers,
      ...loadedState.timers
    },

    ui: {
      ...fresh.ui,
      ...loadedState.ui
    },

    meta: {
      ...fresh.meta,
      ...loadedState.meta
    }
  };
}