import { PATTERNS } from "../data/patterns/patterns.js";
import { numberStringToValue } from "./helpers/patternHelpers.js";
import { pushBestRoll, pushRollHistory } from "./helpers/statsHelpers.js";
import { getUpgradeConfig } from "./helpers/upgradeHelpers.js";
import { addBigNum, maxBigNum, multiplyBigNum, multiplyBigNumByNumber, subtractBigNum, toBigNum, zeroBigNum, oneBigNum, roundMultiplierBigNum, makeBigNum } from "../utils/bigNum.js";
import { getAutomationConfig, shouldDisplayAutoRoll } from "./helpers/automationHelpers.js";
import { getCastingUpgradeConfig } from "./helpers/castingUpgradeHelpers.js";

// Main function to perform a loop. Returns the roll and saves it into state
// { source = "manual" } = {} is a fancy way to write "If there's no second argument, or it's empty, return manual"
export function performRoll(state, { source = "manual" } = {}) {
  const digitCount = getRollDigitCount(state, source);
  const raw = generateRollString(digitCount, source);

  const rollResult = evaluateRollString(state, raw, {
    source,
    includeGlobal: true,
    includePostMultiplierFlatBonus: true,
    includePatternCurrency: true
  });

  applyRollResult(state, rollResult, { source });
  return rollResult;
}

// Main roll calculation. Checks for patterns, evaluates value after all multipliers, then returns a roll object
export function evaluateRollString(
  state,
  raw,
  {
    source = "manual",
    includeGlobal = true,
    includePostMultiplierFlatBonus = true,
    includePatternCurrency = true
  } = {}
) {
  const digitCount = raw.length;
  const value = numberStringToValue(raw);
  const automationConfig = getAutomationConfig(state);
  const castingConfig = getCastingUpgradeConfig(state);

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

    currentMultiplier = multiplyBigNum(currentMultiplier, upgradeConfig.patternMultiplierFactor);
    currentPatternCurrencyReward = multiplyBigNum(currentPatternCurrencyReward, upgradeConfig.patternCurrencyFactor);

    if (source === "auto") {
      currentMultiplier = scaleAutomationMultiplier(
        currentMultiplier,
        automationConfig.patternMultiplierFactor
      );
      currentPatternCurrencyReward = multiplyBigNumByNumber(
        currentPatternCurrencyReward,
        automationConfig.patternCurrencyFactor
      );
    } else if (source === "manual") {
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

  // General calculation of roll value is given by
  // totalGain = (((preMultFlat + rollValue) x patternMult x globalMult) + postMultFlat) × Casting Multiplier
  const preCastingMultiplier = roundMultiplierBigNum(
    multiplyBigNum(patternMultiplier, globalMultiplier)
  );
  const totalMultiplier = roundMultiplierBigNum(
    multiplyBigNum(preCastingMultiplier, castingMultiplier)
  );
  const multipliedGain = multiplyBigNum(modifiedBaseValue, totalMultiplier);
  const totalGain = addBigNum(multipliedGain, postMultiplierFlatBonus);
  // const totalGain = makeBigNum(3.26, 1533453348); // Piemanray314

  const totalPatternCurrencyGain = includePatternCurrency
    ? getTotalPatternCurrencyGain(matches)
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
    castingMultiplier,
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
function generateRollString(digitCount, source = "manual") {
  let result = "";

  for (let i = 0; i < digitCount; i++) {
    let digit = randomInt(0, 9);

    if (i === 0) {
    const shouldDisallowZero = digitCount > 1 || (digitCount === 1 && source === "auto");

    if (shouldDisallowZero) {
      digit = randomInt(1, 9);
    }
  }

    result += String(digit);
  }

  return result;
}

// Generates a random integer betweein min and max inclusive OBVIOUSLY
// I'm only writing this comment to be consistent and make sure every function has a comment :)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}