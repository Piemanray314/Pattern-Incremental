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
      lifetimePies: zeroBigNum(),
      lifetimeTotalCastedPies: zeroBigNum(),
      bestRollValue: 0,
      bestGain: zeroBigNum(),
      previousRolls: [],
      bestRolls: [],
      selectedBestRollIndex: 0,
      totalCasts: 0,
      rollsThisCast: 0,
      hasManualRollThisCast: false,
      pointsThisCast: zeroBigNum(),
      patternsThisCast: zeroBigNum(),
      castStartTime: Date.now(),
      castElapsedMs: 0,
      previousCasts: [],
      bestShardsPerCast: zeroBigNum(),
      bestShardsPerCastPerSecond: zeroBigNum()
    },

    timers: {
      uiRefreshAccumulatorMs: 0,
      topbarLiveRefreshAccumulatorMs: 0,
      pieFactoryLiveRefreshAccumulatorMs: 0,
      pieFactoryRuntimeAccumulatorMs: 0,
      autoRollAccumulatorMs: 0,
      effectTextRefreshAccumulatorMs: 0,
      autoRecastCooldownMs: 0,
      autoRecastTreeRefreshCooldownMs: 0,
      speedrunAutoRollBurstAccumulatorMs: 0,
      speedrunAutoRollBurstRemainingMs: 0,
      speedrunAutoRollBurstIntervalMs: 100
    },

    automation: {
      enabled: true,
      intervalMs: 10000,
      accumulatorMs: 0,
      displayMode: "big_only",
      recastSettings: {
        enabled: false,
        condition: "shards",
        targetValue: "",
        showConfirmationPrompt: true
      }
    },

    automationUpgrades: {},
    
    castingUpgrades: {},

    pieUpgrades: {},

    challenges: {
      activeChallengeId: null,
      claimableChallengeId: null,
      startedAtMs: null,
      challengeElapsedMs: 0,
      manualRollClicksThisRun: 0,
      autoExitOnComplete: false,
      phase: "idle",
      completions: {}
    },

    pieFactory: {
      tiers: {
        piemen: {
          count: { mantissa: 1, exponent: 0 },
          level: 1,
          progressBuffer: 0,
          purchases: 0
        },
        pieFactory: {
          count: zeroBigNum(),
          level: 0,
          progressBuffer: 0,
          purchases: 0
        },
        piePlanet: {
          count: zeroBigNum(),
          level: 0,
          progressBuffer: 0,
          purchases: 0
        },
        pieGalaxy: {
          count: zeroBigNum(),
          level: 0,
          progressBuffer: 0,
          purchases: 0
        },
        pieUniverse: {
          count: zeroBigNum(),
          level: 0,
          progressBuffer: 0,
          purchases: 0
        },
        pieDimension: {
          count: zeroBigNum(),
          level: 0,
          progressBuffer: 0,
          purchases: 0
        }
      },
      castedPies: zeroBigNum(),
      investedCastedPiesLifetime: zeroBigNum(),
      globalProductionMultiplier: { mantissa: 1, exponent: 0 },
      accumulatedPiesThisTierBoost: zeroBigNum(),
      rebakeTierMultiplier: { mantissa: 1, exponent: 0 },
      rebakeAffectedTierCount: 1
    },

    ui: {
      activeTab: loadActiveTab() ?? "roll",
      patternPreviewInput: "",
      patternPreviewIncludeGlobal: true,
      patternPreviewIncludeAutomation: false,

      upgradesSubtab: loadSubtab("upgradesSubtab") ?? "main",
      automationSubtab: loadSubtab("automationSubtab") ?? "main",
      guideSubtab: loadSubtab("guideSubtab") ?? "rolls",
      castingSubtab: loadSubtab("castingSubtab") ?? "recast",
      pieFactorySubtab: loadSubtab("pieFactorySubtab") ?? "overview",
      upgradeTreeView_main: loadTreeViewPosition("upgradeTreeView_main") ?? { scrollLeft: 0, scrollTop: 0, zoom : 1 },
      upgradeTreeView_4: loadTreeViewPosition("upgradeTreeView_4") ?? { scrollLeft: 0, scrollTop: 0, zoom : 1 },
      upgradeTreeView_5: loadTreeViewPosition("upgradeTreeView_5") ?? { scrollLeft: 0, scrollTop: 0, zoom : 1 },
      automationTreeView: loadTreeViewPosition("automationTreeView") ?? { scrollLeft: 0, scrollTop: 0, zoom : 1 },
      castingTreeView_casts: loadTreeViewPosition("castingTreeView_casts") ?? { scrollLeft: 0, scrollTop: 0, zoom : 1 },
      castingTreeView_shards: loadTreeViewPosition("castingTreeView_shards") ?? { scrollLeft: 0, scrollTop: 0, zoom : 1 },
      pieUpgradeTreeView: loadTreeViewPosition("pieUpgradeTreeView") ?? { scrollLeft: 0, scrollTop: 0, zoom : 1 },

      showChangeLogModal: false,
      offlineProgress: {
        active: false,
        complete: false,
        elapsedMs: 0,
        tickMs: 1000,
        totalTicks: 0,
        ticksDone: 0,
        before: null,
        after: null,
        calculatedRolls: 0
      }
    },
    
    settings: {
      numberFormatMode: "standard",
      manualRollPopAnimationEnabled: true,
      autoRollPopAnimationEnabled: true
    },

    meta: {
      saveVersion: 0.91,
      lastSavedAt: Date.now()
    }
  };
}
