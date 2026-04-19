import { createInitialState } from "./initialState.js";
import { UPGRADES } from "../data/upgrades.js";
import { AUTOMATION_UPGRADES } from "../data/automationUpgrades.js";
import { PATTERNS } from "../data/patterns.js";
import { isBigNum, serializeBigNum, deserializeBigNum } from "../utils/bigNum.js";

let CURRENT_SAVE_VERSION = "0.3"; // Main version control

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
      pies: state.currencies.pies
    },

    progression: {
      maxDigitsUnlocked: state.progression.maxDigitsUnlocked
    },

    upgrades: state.upgrades,
    automationUpgrades: state.automationUpgrades,

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
      selectedBestRollIndex: state.stats.selectedBestRollIndex ?? 0
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

  /* Example version check for refunding upgrades

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

    stats: {
      ...fresh.stats,
      ...loadedState.stats
    },

    automation: {
      ...fresh.automation,
      ...loadedState.automation
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
  const validUpgradeIds = new Set(UPGRADES.map((u) => u.id));
  const validAutomationUpgradeIds = new Set(AUTOMATION_UPGRADES.map((u) => u.id));

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
  state.currencies.pies = deserializeBigNum(state.currencies.pies);

  state.stats.lifetimePointsGained = deserializeBigNum(state.stats.lifetimePointsGained);
  state.stats.lifetimePatternCurrency = deserializeBigNum(state.stats.lifetimePatternCurrency);
  state.stats.bestGain = deserializeBigNum(state.stats.bestGain);

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

// import { AUTOMATION_UPGRADES } from "../data/automationUpgrades.js";
// import { addBigNum, zeroBigNum } from "../utils/bigNum.js";
// import { getUpgradeCost } from "../core/upgradeHelpers.js";

/* Example function used in example version check. This refunds all automation upgrades

function refundAutomationUpgrades(state) {
  let refund = zeroBigNum();

  for (const upgrade of AUTOMATION_UPGRADES) {
    const ownedLevel = state.automationUpgrades?.[upgrade.id] ?? 0;
    if (ownedLevel <= 0) continue;

    for (let level = 0; level < ownedLevel; level++) {
      const fakeState = {
        ...state,
        automationUpgrades: {
          ...state.automationUpgrades,
          [upgrade.id]: level
        }
      };

      const cost = getUpgradeCost(fakeState, upgrade);
      if (!cost) continue;

      const pointCost = cost.points ?? zeroBigNum();
      refund = addBigNum(refund, pointCost);
    }
  }

  state.currencies.points = addBigNum(state.currencies.points, refund);
  state.automationUpgrades = {};

  return state;
}
  */

/* Example function used in example version check. This refunds a specific automation upgrade
 
function refundSpecificAutomationUpgrade(state, upgradeId) {
  const upgrade = AUTOMATION_UPGRADES.find((u) => u.id === upgradeId);
  if (!upgrade) return state;

  const ownedLevel = state.automationUpgrades?.[upgradeId] ?? 0;
  if (ownedLevel <= 0) return state;

  let refund = zeroBigNum();

  for (let level = 0; level < ownedLevel; level++) {
    const fakeState = {
      ...state,
      automationUpgrades: {
        ...state.automationUpgrades,
        [upgradeId]: level
      }
    };

    const cost = getUpgradeCost(fakeState, upgrade);
    if (!cost) continue;

    refund = addBigNum(refund, cost.points ?? zeroBigNum());
  }

  state.currencies.points = addBigNum(state.currencies.points, refund);
  delete state.automationUpgrades[upgradeId];

  return state;
}
  */