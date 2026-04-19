import { zeroBigNum } from "../utils/bigNum.js";

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
      activeTab: "roll",
      patternPreviewInput: "",
      patternPreviewIncludeGlobal: false,
      upgradeTreeView: {
        scrollLeft: 0,
        scrollTop: 0
      },
      showChangeLogModal: false,
    },

    settings: {
      numberFormat: "standard"
    },

    meta: {
      saveVersion: 0.12,
      lastSavedAt: Date.now()
    }
  };
}