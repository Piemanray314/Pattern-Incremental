import { PATTERNS } from "../data/patterns/patterns.js";
import { numberStringToValue } from "./helpers/patternHelpers.js";
import { pushBestRoll, pushRollHistory } from "./helpers/statsHelpers.js";
import { getUpgradeConfig } from "./helpers/upgradeHelpers.js";
import { addBigNum, compareBigNum, maxBigNum, multiplyBigNum, multiplyBigNumByNumber, subtractBigNum, toBigNum, zeroBigNum, oneBigNum, roundMultiplierBigNum, makeBigNum } from "../utils/bigNum.js";
import { getAutomationConfig, shouldDisplayAutoRoll } from "./helpers/automationHelpers.js";
import { getCastingUpgradeConfig, getMultiplierRollConfig } from "./helpers/castingUpgradeHelpers.js";
import { getNakedPatternCurrencyMultiplier, isNakedChallengeActive } from "./helpers/challengeHelpers.js";

// Main function to perform a loop. Returns the roll and saves it into state
// { source = "manual" } = {} is a fancy way to write "If there's no second argument, or it's empty, return manual"
export function performRoll(state, { source = "manual" } = {}) {
  if (source === "manual" && state.challenges?.activeChallengeId === "CHAL00100") {
    state.challenges.manualRollClicksThisRun = (state.challenges.manualRollClicksThisRun ?? 0) + 1;
  }

  const digitCount = getRollDigitCount(state, source);
  const raw = generateRollString(state, digitCount, source);

  if (source === "manual") {
    const radius = getLittleGiantsAdjacencyRadius(state);
    if (radius > 0) {
      return performManualAdjacentRolls(state, raw, radius);
    }
  }

  const rollResult = evaluateRollString(state, raw, {
    source,
    includeGlobal: true,
    includePostMultiplierFlatBonus: true,
    includePatternCurrency: true,
    includeMultiplierRolls: true
  });

  applyRollResult(state, rollResult, { source });
  return rollResult;
}

// Handles Little Giants adjacent roll reward for manual rolls
function performManualAdjacentRolls(state, baseRaw, radius) {
  const baseValue = numberStringToValue(baseRaw);
  const seenRaw = new Set();
  let bestResult = null;

  for (let offset = -radius; offset <= radius; offset++) {
    const value = baseValue + offset;
    if (value < 0) continue;

    const raw = String(value);
    if (seenRaw.has(raw)) continue;
    seenRaw.add(raw);

    const rollResult = evaluateRollString(state, raw, {
      source: "manual",
      includeGlobal: true,
      includePostMultiplierFlatBonus: true,
      includePatternCurrency: true,
      includeMultiplierRolls: true
    });

    applyRollResult(state, rollResult, { source: "manual" });

    if (!bestResult || compareBigNum(rollResult.totalGain, bestResult.totalGain) > 0) {
      bestResult = rollResult;
    }
  }

  if (bestResult) {
    state.currentRoll = bestResult;
  }

  return bestResult ?? state.currentRoll;
}

// Main roll calculation. Checks for patterns, evaluates value after all multipliers, then returns a roll object
export function evaluateRollString(
  state,
  raw,
  {
    source = "manual",
    includeGlobal = true,
    includePostMultiplierFlatBonus = true,
    includePatternCurrency = true,
    includeMultiplierRolls = true
  } = {}
) {
  const digitCount = raw.length;
  const value = numberStringToValue(raw);
  const automationConfig = getAutomationConfig(state);
  const castingConfig = getCastingUpgradeConfig(state);
  const nakedChallengeActive = isNakedChallengeActive(state);

  // Keeps track of pattern matches
  const matches = [];

  const baseRollValue = toBigNum(value);
  const upgradeConfig = getUpgradeConfig(state);

  // Piemanray314
  // Duplicate pattern check
  const seen = new Set();

  for (const pattern of PATTERNS) {
    if (seen.has(pattern.id)) {
      console.error(`Duplicate pattern id: ${pattern.id}`);
    }
    seen.add(pattern.id);
  }

  // Checks every pattern for matches
  for (const pattern of PATTERNS) {
    if (!pattern.visibleWhen(state)) continue;
    if (!pattern.unlockedWhen(state)) continue;

    if ((pattern.requiredDigits ?? 1) > digitCount) continue;

    const result = pattern.evaluate(raw, state);
    if (!result) continue;

    const basePatternCurrencyReward =
      typeof pattern.patternCurrencyReward === "function"
        ? toBigNum(pattern.patternCurrencyReward(raw, state))
        : oneBigNum();

    let currentMultiplier = roundMultiplierBigNum(toBigNum(result.currentMultiplier ?? result.baseMultiplier));
    let currentPatternCurrencyReward = roundMultiplierBigNum(toBigNum(result.currentPatternCurrencyReward ?? basePatternCurrencyReward));

    currentPatternCurrencyReward = addBigNum(currentPatternCurrencyReward, toBigNum(castingConfig.patternFlat));
    currentPatternCurrencyReward = multiplyBigNum(currentPatternCurrencyReward, castingConfig.patternMultiplier);

    if (nakedChallengeActive) {
      currentMultiplier = roundMultiplierBigNum(toBigNum(result.baseMultiplier));
    } else {
      currentMultiplier = multiplyBigNum(currentMultiplier, upgradeConfig.patternMultiplierFactor);
    }
    currentPatternCurrencyReward = multiplyBigNum(currentPatternCurrencyReward, upgradeConfig.patternCurrencyFactor);

    if (!nakedChallengeActive && source === "auto") {
      currentMultiplier = scaleAutomationMultiplier(
        currentMultiplier,
        automationConfig.patternMultiplierFactor
      );
      currentPatternCurrencyReward = multiplyBigNumByNumber(
        currentPatternCurrencyReward,
        automationConfig.patternCurrencyFactor
      );
    } else if (!nakedChallengeActive && source === "manual") {
      currentMultiplier = multiplyBigNum(
        currentMultiplier,
        upgradeConfig.manualPatternMultiplierFactor
      );
      currentPatternCurrencyReward = multiplyBigNum(
        currentPatternCurrencyReward,
        upgradeConfig.manualPatternCurrencyFactor
      );
    }

    matches.push({
      patternId: pattern.id,
      patternName: pattern.name,
      description: pattern.description,
      highlightedIndices: result.highlightedIndices,
      baseMultiplier: toBigNum(result.baseMultiplier),
      currentMultiplier,
      basePatternCurrencyReward,
      currentPatternCurrencyReward
    });
  }

  const preMultiplierFlatBonus = toBigNum(upgradeConfig.preMultiplierFlatBonus);
  const modifiedBaseValue = addBigNum(baseRollValue, preMultiplierFlatBonus);
  const patternMultiplier = roundMultiplierBigNum(getPatternMultiplier(matches));

  let globalMultiplier = includeGlobal
    ? toBigNum(upgradeConfig.globalMultiplier)
    : oneBigNum();

  if (source === "auto") {
    globalMultiplier = scaleAutomationMultiplier(
      globalMultiplier,
      automationConfig.globalMultiplierFactor
    );
  } else if (source === "manual") {
    globalMultiplier = multiplyBigNum(
      globalMultiplier,
      upgradeConfig.manualGlobalMultiplier
    );
  }

  const postMultiplierFlatBonus = includePostMultiplierFlatBonus
    ? toBigNum(upgradeConfig.postMultiplierFlatBonus)
    : zeroBigNum();

  const castingMultiplier = toBigNum(castingConfig.pointMultiplier);

  let multiplierRolls = [];
  let multiplierRollTotal = oneBigNum();

  if (includeMultiplierRolls) {
    const rolled = rollMultiplierDice(state);
    multiplierRolls = rolled.multiplierRolls;
    multiplierRollTotal = rolled.multiplierRollTotal;
  }

  const preCastingMultiplier = roundMultiplierBigNum(
    multiplyBigNum(patternMultiplier, globalMultiplier)
  );

  const preMultiplierRollMultiplier = roundMultiplierBigNum(
    multiplyBigNum(preCastingMultiplier, castingMultiplier)
  );

  const totalMultiplier = roundMultiplierBigNum(
    multiplyBigNum(preMultiplierRollMultiplier, multiplierRollTotal)
  );

  const multipliedGain = multiplyBigNum(modifiedBaseValue, totalMultiplier);
  const totalGain = addBigNum(multipliedGain, postMultiplierFlatBonus);
  // const totalGain = makeBigNum(3.26, 1533453348); // Piemanray314

  const nakedRewardMultiplier = getNakedPatternCurrencyMultiplier(state);
  const totalPatternCurrencyGain = includePatternCurrency
    ? multiplyBigNumByNumber(getTotalPatternCurrencyGain(matches), nakedRewardMultiplier)
    : zeroBigNum();

  return {
    raw,
    value,
    digitCount,
    source,
    matches,

    baseRollValue,
    preMultiplierFlatBonus,
    modifiedBaseValue,

    patternMultiplier,
    globalMultiplier,
    preCastingMultiplier,
    castingMultiplier,
    preMultiplierRollMultiplier,
    multiplierRolls,
    multiplierRollTotal,
    totalMultiplier,

    postMultiplierFlatBonus,
    multipliedGain,
    totalGain,

    totalPatternCurrencyGain,
    enteredBestRolls: false
  };
}

// Updates the state with the given roll result
function applyRollResult(state, rollResult, { source }) {
  state.latestRoll = rollResult;
  state.currencies.points = addBigNum(state.currencies.points, rollResult.totalGain);
  state.currencies.patterns = addBigNum(state.currencies.patterns, rollResult.totalPatternCurrencyGain);

  state.stats.totalRolls += 1;
  state.stats.rollsThisCast += 1;
  state.stats.pointsThisCast = addBigNum(
    state.stats.pointsThisCast,
    rollResult.totalGain
  );
  state.stats.patternsThisCast = addBigNum(
    state.stats.patternsThisCast,
    rollResult.totalPatternCurrencyGain
  );
  state.stats.lifetimePointsGained = addBigNum(
    state.stats.lifetimePointsGained,
    rollResult.totalGain
  );
  state.stats.lifetimePatternCurrency = addBigNum(
    state.stats.lifetimePatternCurrency,
    rollResult.totalPatternCurrencyGain
  );
  state.stats.bestRollValue = Math.max(state.stats.bestRollValue, rollResult.value);
  state.stats.bestGain = maxBigNum(state.stats.bestGain, rollResult.totalGain);

  pushRollHistory(state, rollResult);
  const enteredBestRolls = pushBestRoll(state, rollResult);
  rollResult.enteredBestRolls = enteredBestRolls;

  if (source === "manual") {
    state.currentRoll = rollResult;
    return;
  }

  if (source === "auto" && shouldDisplayAutoRoll(state, rollResult)) {
    state.currentRoll = rollResult;
  }
}

// Returns the number of digits in the roll
function getRollDigitCount(state, source) {
  if (source !== "auto") {
    return state.progression.maxDigitsUnlocked;
  }

  const automationConfig = getAutomationConfig(state);
  return Math.max(1, Math.min(automationConfig.digitCap, state.progression.maxDigitsUnlocked));
}

// Returns the final multiplier after all patterns
function getPatternMultiplier(matches) {
  let product = oneBigNum();

  for (const match of matches) {
    product = multiplyBigNum(product, match.currentMultiplier);
  }

  return product;
}

// Returns the final gain of patterns currency after all matches
function getTotalPatternCurrencyGain(matches) {
  let total = zeroBigNum();

  for (const match of matches) {
    total = addBigNum(total, match.currentPatternCurrencyReward ?? zeroBigNum());
  }

  return total;
}

// Returns the multiplier for automated rolls
// Slightly redundant, used to be more complicated
function scaleAutomationMultiplier(multiplier, factor) {
  const bigMultiplier = toBigNum(multiplier);
  return multiplyBigNumByNumber(bigMultiplier, factor);
}

// Generates a random roll string
function generateRollString(state, digitCount, source = "manual") {
  let result = "";
  const littleGiantsActive = isLittleGiantsActive(state);

  for (let i = 0; i < digitCount; i++) {
    let digit = randomInt(0, 9);

    if (i === 0) {
    const shouldDisallowZero =
      digitCount > 1 ||
      (digitCount === 1 && source === "auto") ||
      (digitCount === 1 && source === "manual" && littleGiantsActive);

    if (shouldDisallowZero) {
      digit = randomInt(1, 9);
    }
  }

    result += String(digit);
  }

  return result;
}

// Returns Little Giants adjacency radius from completions
function getLittleGiantsAdjacencyRadius(state) {
  const completions = state.challenges?.completions?.["CHAL00100"] ?? 0;
  if (completions <= 0) return 0;
  return Math.min(2, completions);
}

// Returns true when Little Giants is currently active
function isLittleGiantsActive(state) {
  return state?.challenges?.activeChallengeId === "CHAL00100";
}

// Rolls all active multiplier dice, returning both individual dice and total multiplier
function rollMultiplierDice(state) {
  const config = getMultiplierRollConfig(state);

  const rolls = [];
  let total = oneBigNum();

  for (let i = 0; i < config.count; i++) {
    const dieConfig = config.dice[i];
    const multiplier = rollSingleMultiplierDie(dieConfig);

    rolls.push({
      index: i,
      label: `Multiplier ${i + 1}`,
      multiplier
    });

    total = multiplyBigNum(total, multiplier);
  }

  return {
    multiplierRolls: rolls,
    multiplierRollTotal: total
  };
}

// Rolls one multiplier die (flat and exponential)
function rollSingleMultiplierDie(config) {
  if (!config) return oneBigNum();

  if (config.mode === "exponent") {
    const minExp = Math.floor(config.minExp ?? 1);
    const maxExp = Math.floor(config.maxExp ?? minExp);
    const exponent = randomInt(minExp, maxExp);

    return makeBigNum(1, exponent);
  }

  const min = Math.floor(config.min ?? 1);
  const max = Math.floor(config.max ?? min);
  return toBigNum(randomInt(min, max));
}

// Generates a random integer betweein min and max inclusive OBVIOUSLY
// I'm only writing this comment to be consistent and make sure every function has a comment :)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
