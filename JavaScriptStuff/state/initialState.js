import { zeroBigNum } from "../utils/bigNum.js";
import { loadActiveTab, loadTreeViewPosition, loadSubtab } from "./uiState.js";

export function createInitialState() {
  return {
    currencies: {
      points: zeroBigNum(),
      patterns: zeroBigNum(),
      casts: zeroBigNum(),
      shards: zeroBigNum(),
      pies: zeroBigNum()
    },

    progression: {
      maxDigitsUnlocked: 1,
      castingUnlocked: false
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
      selectedBestRollIndex: 0,
      totalCasts: 0,
      rollsThisCast: 0,
      pointsThisCast: zeroBigNum(),
      patternsThisCast: zeroBigNum(),
      previousCasts: [],
    },

    timers: {
      uiRefreshAccumulatorMs: 0,
      autoRollAccumulatorMs: 0
    },

    automation: {
      enabled: true,
      intervalMs: 10000,
      accumulatorMs: 0,
      displayMode: "big_only"
    },

    automationUpgrades: {},
    
    castingUpgrades: {},

    ui: {
      activeTab: loadActiveTab() ?? "roll",
      patternPreviewInput: "",
      patternPreviewIncludeGlobal: false,
      patternPreviewIncludeAutomation: false,

      upgradesSubtab: loadSubtab("upgradesSubtab") ?? "main",
      automationSubtab: loadSubtab("automationSubtab") ?? "main",
      guideSubtab: loadSubtab("guideSubtab") ?? "rolls",
      castingSubtab: loadSubtab("castingSubtab") ?? "recast",
      upgradeTreeView_main: loadTreeViewPosition("upgradeTreeView_main") ?? { scrollLeft: 0, scrollTop: 0 },
      upgradeTreeView_4: loadTreeViewPosition("upgradeTreeView_4") ?? { scrollLeft: 0, scrollTop: 0 },
      upgradeTreeView_5: loadTreeViewPosition("upgradeTreeView_5") ?? { scrollLeft: 0, scrollTop: 0 },
      automationTreeView: loadTreeViewPosition("automationTreeView") ?? { scrollLeft: 0, scrollTop: 0 },
      castingTreeView_casts: loadTreeViewPosition("castingTreeView_casts") ?? { scrollLeft: 0, scrollTop: 0 },
      castingTreeView_shards: loadTreeViewPosition("castingTreeView_shards") ?? { scrollLeft: 0, scrollTop: 0 },

      showChangeLogModal: false
    },
    
    settings: {
      numberFormat: "standard"
    },

    meta: {
      saveVersion: 0.6,
      lastSavedAt: Date.now()
    }
  };
}