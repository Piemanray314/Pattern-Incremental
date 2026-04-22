import { createInitialState } from "./initialState.js";
import { UPGRADE_TREE_GROUPS } from "../data/upgradeTreeGroups.js";
import { AUTOMATION_TREE_GROUPS } from "../data/automationTreeGroups.js";
import { PATTERNS } from "../data/patterns.js";
import { isBigNum, serializeBigNum, deserializeBigNum } from "../utils/bigNum.js";

let CURRENT_SAVE_VERSION = "0.6"; // Main version control

// Converts state into a JSON stirng. Ran from renderSettingsTab: renderImportExportPanel
export function serializeSave(state) {
  const compactState = buildCompactState(state);

  return JSON.stringify(
    {
      saveVersion: CURRENT_SAVE_VERSION,
      exportedAt: Date.now(),
      gameState: compactState
    }, 
    null,
    0
  );
}

// Parses imported save text, extracts its version, and migrates it into the current state format
export function deserializeSave(text) {
  const parsed = JSON.parse(text);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid save file.");
  }

  const saveVersion =
  typeof parsed.saveVersion === "string" || typeof parsed.saveVersion === "number"
    ? parsed.saveVersion : 0;

  const rawState = parsed.gameState ?? parsed;
  return migrateSave(rawState, saveVersion);
}

// Builds the compact gameState object that will be stored inside the save file.
function buildCompactState(state) {
  return {
    currencies: {
      points: state.currencies.points,
      patterns: state.currencies.patterns,
      casts: state.currencies.casts,
      shards: state.currencies.shards,
      pies: state.currencies.pies
    },

    progression: {
      maxDigitsUnlocked: state.progression.maxDigitsUnlocked,
      castingUnlocked: state.progression.castingUnlocked
    },

    upgrades: state.upgrades,
    automationUpgrades: state.automationUpgrades,
    castingUpgrades: state.castingUpgrades,

    currentRoll: compactRollSnapshot(state.currentRoll),
    latestRoll: compactRollSnapshot(state.latestRoll),

    stats: {
      totalRolls: state.stats.totalRolls,
      totalTimeStartedAt: state.stats.totalTimeStartedAt,
      lifetimePointsGained: state.stats.lifetimePointsGained,
      lifetimePatternCurrency: state.stats.lifetimePatternCurrency,
      bestRollValue: state.stats.bestRollValue,
      bestGain: state.stats.bestGain,
      previousRolls: (state.stats.previousRolls ?? []).map(compactRollSnapshot),
      bestRolls: (state.stats.bestRolls ?? []).map(compactRollSnapshot),
      selectedBestRollIndex: state.stats.selectedBestRollIndex ?? 0,
      totalCasts: state.stats.totalCasts,
      rollsThisCast: state.stats.rollsThisCast,
      pointsThisCast: state.stats.pointsThisCast,
      patternsThisCast: state.stats.patternsThisCast,
      previousCasts: state.stats.previousCasts ?? []
    },

    automation: {
      enabled: state.automation.enabled,
      intervalMs: state.automation.intervalMs,
      pauseRemainingMs: state.automation.pauseRemainingMs,
      pauseAutomationOnManualRoll: state.automation.pauseAutomationOnManualRoll,
      displayMode: state.automation.displayMode
    },

    settings: {
      numberFormatMode: state.settings.numberFormatMode
    },

    meta: {
      saveVersion: CURRENT_SAVE_VERSION,
      lastSavedAt: Date.now()
    }
  };
}

// Used for rolls (e.g. best rolls). Compacts all bigNums with compactValue to save space
function compactRollSnapshot(roll) {
  if (!roll) return null;

  return {
    raw: roll.raw,
    source: roll.source ?? "manual",

    value: roll.value,
    baseRollValue: compactValue(roll.baseRollValue),
    preMultiplierFlatBonus: compactValue(roll.preMultiplierFlatBonus),
    modifiedBaseValue: compactValue(roll.modifiedBaseValue),
    patternMultiplier: compactValue(roll.patternMultiplier),
    globalMultiplier: compactValue(roll.globalMultiplier),
    castingMultiplier: compactValue(roll.castingMultiplier),
    totalMultiplier: compactValue(roll.totalMultiplier),
    postMultiplierFlatBonus: compactValue(roll.postMultiplierFlatBonus),
    multipliedGain: compactValue(roll.multipliedGain),
    totalGain: compactValue(roll.totalGain),
    totalPatternCurrencyGain: compactValue(roll.totalPatternCurrencyGain),

    matches: (roll.matches ?? []).map((match) => ({
      patternId: match.patternId,
      highlightedIndices: Array.isArray(match.highlightedIndices) ? match.highlightedIndices : [],
        currentMultiplier: compactValue(match.currentMultiplier),
        currentPatternCurrencyReward: compactValue(match.currentPatternCurrencyReward)
    }))
  };
}

// Main import function. Converts loaded save data into the current state format and fills in any missing fields
export function migrateSave(rawState, saveVersion) {
  let state = structuredCloneSafe(rawState);

  //Example version check for refunding upgrades
  /* 
  if (isVersionBefore(saveVersion, "1.0")) {
    state = refundAutomationUpgrades(state);
  }
  if (isVersionBefore(saveVersion, "0.4")) {
    state = refundSpecificAutomationUpgrade(state, "AUTO030201");
  }
  */

  state = hydrateAgainstInitialState(state);
  state = filterInvalidUpgradeIds(state);
  state = normalizeBigNumFields(state);
  state = rebuildRollSnapshots(state);

  state.meta.saveVersion = CURRENT_SAVE_VERSION;
  state.meta.lastSavedAt = Date.now();

  return state;
}

// Starts from a fresh initial state, then overlays loaded save data so new fields get default values.
function hydrateAgainstInitialState(loadedState) {
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

    automationUpgrades: {
      ...fresh.automationUpgrades,
      ...loadedState.automationUpgrades
    },

    castingUpgrades: {
      ...fresh.castingUpgrades,
      ...loadedState.castingUpgrades
    },

    stats: {
      ...fresh.stats,
      ...loadedState.stats
    },

    automation: {
      ...fresh.automation,
      ...loadedState.automation
    },

    ui: {
      ...fresh.ui,
      ...loadedState.ui
    },

    settings: {
      ...fresh.settings,
      ...loadedState.settings
    },

    meta: {
      ...fresh.meta,
      ...loadedState.meta,
      saveVersion: CURRENT_SAVE_VERSION
    }
  };
}

// If save has upgrades that do not exist, they get filtered out here
function filterInvalidUpgradeIds(state) {
  const validUpgradeIds = new Set(
    UPGRADE_TREE_GROUPS.flatMap((group) => group.definitions).map((u) => u.id)
  );
  const validAutomationUpgradeIds = new Set(
    AUTOMATION_TREE_GROUPS.flatMap((group) => group.definitions).map((u) => u.id)
  );

  state.upgrades = Object.fromEntries(
    Object.entries(state.upgrades ?? {}).filter(([id]) => validUpgradeIds.has(id))
  );

  state.automationUpgrades = Object.fromEntries(
    Object.entries(state.automationUpgrades ?? {}).filter(([id]) => validAutomationUpgradeIds.has(id))
  );

  return state;
}

// Restores saved BigNum fields back into their runtime format after loading a save
function normalizeBigNumFields(state) {
  state.currencies.points = deserializeBigNum(state.currencies.points);
  state.currencies.patterns = deserializeBigNum(state.currencies.patterns);
  state.currencies.casts = deserializeBigNum(state.currencies.casts);
  state.currencies.shards = deserializeBigNum(state.currencies.shards);
  state.currencies.pies = deserializeBigNum(state.currencies.pies);

  state.stats.lifetimePointsGained = deserializeBigNum(state.stats.lifetimePointsGained);
  state.stats.lifetimePatternCurrency = deserializeBigNum(state.stats.lifetimePatternCurrency);
  state.stats.bestGain = deserializeBigNum(state.stats.bestGain);
  state.stats.pointsThisCast = deserializeBigNum(state.stats.pointsThisCast);
  state.stats.patternsThisCast = deserializeBigNum(state.stats.patternsThisCast);

  state.stats.previousCasts = (state.stats.previousCasts ?? []).map((cast) => ({
    ...cast,
    points: deserializeBigNum(cast.points),
    patterns: deserializeBigNum(cast.patterns),
    castsGained: deserializeBigNum(cast.castsGained),
    shardsGained: deserializeBigNum(cast.shardsGained)
  }));


  if (state.currentRoll) normalizeCompactRoll(state.currentRoll);
  if (state.latestRoll) normalizeCompactRoll(state.latestRoll);

  state.stats.previousRolls = (state.stats.previousRolls ?? []).map(normalizeCompactRoll);
  state.stats.bestRolls = (state.stats.bestRolls ?? []).map(normalizeCompactRoll);

  return state;
}

// Restores BigNum fields inside a saved roll snapshot and fills in default match metadata
function normalizeCompactRoll(roll) {
  if (!roll) return roll;

  roll.baseRollValue = deserializeBigNum(roll.baseRollValue);
  roll.preMultiplierFlatBonus = deserializeBigNum(roll.preMultiplierFlatBonus);
  roll.modifiedBaseValue = deserializeBigNum(roll.modifiedBaseValue);
  roll.patternMultiplier = deserializeBigNum(roll.patternMultiplier);
  roll.globalMultiplier = deserializeBigNum(roll.globalMultiplier);
  roll.castingMultiplier = deserializeBigNum(roll.castingMultiplier ?? 1);
  roll.totalMultiplier = deserializeBigNum(roll.totalMultiplier ?? roll.multiplier);
  roll.postMultiplierFlatBonus = deserializeBigNum(roll.postMultiplierFlatBonus);
  roll.multipliedGain = deserializeBigNum(roll.multipliedGain);
  roll.totalGain = deserializeBigNum(roll.totalGain ?? roll.gain);
  roll.totalPatternCurrencyGain = deserializeBigNum(roll.totalPatternCurrencyGain ?? 0);

  roll.matches = (roll.matches ?? []).map((match) => ({
    patternId: match.patternId,
    highlightedIndices: Array.isArray(match.highlightedIndices) ? match.highlightedIndices : [],
    currentMultiplier: deserializeBigNum(match.currentMultiplier),
    currentPatternCurrencyReward: deserializeBigNum(match.currentPatternCurrencyReward),
    patternName: "",
    description: "",
    outdated: false
  }));

  return roll;
}

// Only IDs are saved during saves, so this rebuilds everything else needed
function rebuildRollSnapshots(state) {
  const patternMap = new Map(PATTERNS.map((pattern) => [pattern.id, pattern]));

  state.currentRoll = rebuildSingleRollSnapshot(state.currentRoll, patternMap);
  state.latestRoll = rebuildSingleRollSnapshot(state.latestRoll, patternMap);
  state.stats.previousRolls = (state.stats.previousRolls ?? []).map((roll) =>
    rebuildSingleRollSnapshot(roll, patternMap)
  );
  state.stats.bestRolls = (state.stats.bestRolls ?? []).map((roll) =>
    rebuildSingleRollSnapshot(roll, patternMap)
  );

  return state;
}

// Rebuilds roll data from pattern IDs and marks the roll as outdated if any pattern is missing
function rebuildSingleRollSnapshot(roll, patternMap) {
  if (!roll) return roll;

  let hasMissingPattern = false;

  roll.matches = (roll.matches ?? []).map((match) => {
    const pattern = patternMap.get(match.patternId);

    if (!pattern) {
      hasMissingPattern = true;
      return {
        ...match,
        patternName: `[Missing Pattern: ${match.patternId}]`,
        description: "Outdated roll - may not be accurate",
        outdated: true
      };
    }

    return {
      ...match,
      patternName: pattern.name,
      description: pattern.description,
      outdated: false
    };
  });

  roll.outdated = hasMissingPattern;
  return roll;
}

// Clones JSON to not mutate original object 
function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

// If BigNum, rounds it to 12 digits or whatever is specified in bigNum: serializeBigNum
function compactValue(value) {
  return isBigNum(value) ? serializeBigNum(value) : value;
}

// Compares versions, returns if a is older than b
function isVersionBefore(a, b) {
  const av = parseVersion(a);
  const bv = parseVersion(b);

  if (av.major !== bv.major) return av.major < bv.major;
  return av.minor < bv.minor;
}

// Version comparison logic for numbers and strings using {major version, minor version}
function parseVersion(version) {
  if (typeof version === "number") {
    const major = Math.floor(version);
    const minor = Math.round((version - major) * 100);
    return { major, minor };
  }

  if (typeof version === "string") {
    const [majorPart = "0", minorPart = "0"] = version.split(".");
    return {
      major: Number(majorPart),
      minor: Number(minorPart)
    };
  }

  return { major: 0, minor: 0 };
}