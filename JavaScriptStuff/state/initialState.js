import { zeroBigNum } from "../utils/bigNum.js";
import { loadActiveTab, loadTreeViewPosition } from "./uiState.js";

export function createInitialState() {
  return {
    currencies: {
      points: zeroBigNum(),
      patterns: zeroBigNum(),
      pies: zeroBigNum()
    },

    progression: {
      maxDigitsUnlocked: 1
    },

    upgrades: {
      DIG01: 1
    },

    currentRoll: null,
    latestRoll: null,

    stats: {
      totalRolls: 0,
      totalTimeStartedAt: Date.now(),
      lifetimePointsGained: zeroBigNum(),
      lifetimePatternCurrency: zeroBigNum(),
      bestRollValue: 0,
      bestGain: zeroBigNum(),
      previousRolls: [],
      bestRolls: [],
      selectedBestRollIndex: 0
    },

    timers: {
      uiRefreshAccumulatorMs: 0,
      autoRollAccumulatorMs: 0
    },

    automation: {
      enabled: true,
      intervalMs: 10000,
      accumulatorMs: 0,
      pauseRemainingMs: 0,
      pauseAutomationOnManualRoll: true,
      displayMode: "big_only"
    },

    automationUpgrades: {},

    ui: {
      activeTab: loadActiveTab() ?? "roll",
      patternPreviewInput: "",
      patternPreviewIncludeGlobal: false,
      patternPreviewIncludeAutomation: false,

      upgradesSubtab: "main",
      automationSubtab: "main",
      upgradeTreeView_main: loadTreeViewPosition("upgradeTreeView_main") ?? { scrollLeft: 0, scrollTop: 0 },
      upgradeTreeView_4: loadTreeViewPosition("upgradeTreeView_4") ?? { scrollLeft: 0, scrollTop: 0 },
      upgradeTreeView_5: loadTreeViewPosition("upgradeTreeView_5") ?? { scrollLeft: 0, scrollTop: 0 },
      automationTreeView: loadTreeViewPosition("automationTreeView") ?? { scrollLeft: 0, scrollTop: 0 },

      showChangeLogModal: false
    },
    settings: {
      numberFormat: "standard"
    },

    meta: {
      saveVersion: 0.4,
      lastSavedAt: Date.now()
    }
  };
}