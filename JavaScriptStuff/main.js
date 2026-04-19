import { createInitialState } from "./state/initialState.js";
import { loadGame, saveGame } from "./state/save.js";
import { updateGame } from "./core/gameLoop.js";
import {
  initializeAppShell,
  renderTopbarInto,
  renderContentInto,
  refreshSidebarActiveState,
  renderModalInto
} from "./ui/renderApp.js";
import { isBigNum, toBigNum, zeroBigNum } from "./utils/bigNum.js";
import { setNumberFormatMode } from "./utils/format.js";

let state = loadGame() ?? createInitialState();
state = hydrateState(state);
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
    refreshSidebarActiveState(state);
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

  const hydrated = {
    ...fresh,
    ...loadedState,

    currencies: {
      ...fresh.currencies,
      ...loadedState.currencies,
      points: coerceBigNum(loadedState?.currencies?.points, fresh.currencies.points)
    },

    progression: {
      ...fresh.progression,
      ...loadedState.progression
    },

    upgrades: {
      ...fresh.upgrades,
      ...loadedState.upgrades
    },

    automationUpgrades: {
      ...fresh.automationUpgrades,
      ...loadedState.automationUpgrades
    },

    automation: {
      ...fresh.automation,
      ...loadedState.automation
    },

    stats: {
      ...fresh.stats,
      ...loadedState.stats,
      lifetimePointsGained: coerceBigNum(loadedState?.stats?.lifetimePointsGained, fresh.stats.lifetimePointsGained),
      bestGain: coerceBigNum(loadedState?.stats?.bestGain, fresh.stats.bestGain),
      previousRolls: (loadedState?.stats?.previousRolls ?? []).map(hydrateStoredRoll),
      bestRolls: (loadedState?.stats?.bestRolls ?? []).map(hydrateStoredRoll)
    },

    timers: {
      ...fresh.timers,
      ...loadedState.timers
    },

    ui: {
      ...fresh.ui,
      ...loadedState.ui,
      upgradeTreeView: {
        ...fresh.ui.upgradeTreeView,
        ...loadedState?.ui?.upgradeTreeView
      },
      automationTreeView: {
        ...fresh.ui.automationTreeView,
        ...loadedState?.ui?.automationTreeView
      }
    },

    settings: {
      ...fresh.settings,
      ...loadedState.settings
    },

    meta: {
      ...fresh.meta,
      ...loadedState.meta
    },

    currentRoll: hydrateRollResult(loadedState?.currentRoll),
    latestRoll: hydrateRollResult(loadedState?.latestRoll)
  };

  if (!hydrated.currentRoll && hydrated.latestRoll) {
    hydrated.currentRoll = hydrated.latestRoll;
  }

  return hydrated;
}

function hydrateRollResult(rollResult) {
  if (!rollResult) return null;

  return {
    ...rollResult,
    multipliedGain: coerceBigNum(rollResult.multipliedGain, zeroBigNum()),
    totalGain: coerceBigNum(rollResult.totalGain, zeroBigNum())
  };
}

function hydrateStoredRoll(roll) {
  return {
    ...roll,
    gain: coerceBigNum(roll.gain, zeroBigNum()),
    multipliedGain: coerceBigNum(roll.multipliedGain, zeroBigNum())
  };
}

function coerceBigNum(value, fallback) {
  if (isBigNum(value)) return toBigNum(value);
  if (typeof value === "number") return toBigNum(value);
  return fallback;
}
