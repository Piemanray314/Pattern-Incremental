export function createInitialState() {
  return {
    currencies: {
      points: 0,
      patterns: 0,
      pies: 0
    },

    progression: {
      maxDigitsUnlocked: 1
    },

    upgrades: {
      DIG01: 1
    },

    currentRoll: null,

    stats: {
      totalRolls: 0,
      totalTimeStartedAt: Date.now(),
      lifetimePointsGained: 0,
      lifetimePatternCurrency: 0,
      bestRollValue: 0,
      bestGain: 0,
      previousRolls: []
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
      }
    },

    meta: {
      version: 1,
      lastSavedAt: Date.now()
    }
  };
}