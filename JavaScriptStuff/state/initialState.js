import { zeroBigNum } from "../utils/bigNum.js";

export function createInitialState() {
  return {
    currencies: {
      points: zeroBigNum(),
      patterns: 0,
      pies: 0
    },

    progression: {
      maxDigitsUnlocked: 1
    },

    upgrades: {
      DIG01: 1
    },

    automationUpgrades: {},

    currentRoll: null,
    latestRoll: null,

    automation: {
      enabled: true,
      intervalMs: 10000,
      accumulatorMs: 0,
      pauseRemainingMs: 0,
      displayMode: "big_only"
    },

    stats: {
      totalRolls: 0,
      totalTimeStartedAt: Date.now(),
      lifetimePointsGained: zeroBigNum(),
      lifetimePatternCurrency: 0,
      bestRollValue: 0,
      bestGain: zeroBigNum(),
      previousRolls: [],
      bestRolls: []
    },

    timers: {
      uiRefreshAccumulatorMs: 0,
      autoRollAccumulatorMs: 0
    },

    ui: {
      activeTab: "roll",
      patternPreviewInput: "",
      patternPreviewIncludeGlobal: false,
      upgradeTreeView: {
        scrollLeft: 0,
        scrollTop: 0
      },
      automationTreeView: {
        scrollLeft: 0,
        scrollTop: 0
      }
    },

    settings: {
      numberFormatMode: "standard"
    },

    meta: {
      version: 2,
      lastSavedAt: Date.now()
    }
  };
}
