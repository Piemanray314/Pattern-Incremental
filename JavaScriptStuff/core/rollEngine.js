import { PATTERNS } from "../data/patterns.js";
import { numberStringToValue } from "./patternHelpers.js";
import { pushBestRoll, pushRollHistory } from "./statsHelpers.js";
import { getUpgradeConfig } from "./upgradeHelpers.js";
import { addBigNum, maxBigNum, multiplyBigNum, multiplyBigNumByNumber, subtractBigNum, toBigNum, zeroBigNum, oneBigNum, roundMultiplierBigNum, makeBigNum } from "../utils/bigNum.js";
import { getAutomationConfig, shouldDisplayAutoRoll } from "./automationHelpers.js";

// Main function to perform a loop. Returns the roll and saves it into state
// { source = "manual" } = {} is a fancy way to write "If there's no second argument, or it's empty, return manual"
export function performRoll(state, { source = "manual" } = {}) {
  const digitCount = getRollDigitCount(state, source);
  const raw = generateRollString(digitCount);

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

  // Keeps track of pattern matches
  const matches = [];

  // Checks every pattern for matches
  for (const pattern of PATTERNS) {
    if (!pattern.visibleWhen(state)) continue;
    if (!pattern.unlockedWhen(state)) continue;

    const result = pattern.evaluate(raw, state);
    if (!result) continue;

    const basePatternCurrencyReward =
      typeof pattern.patternCurrencyReward === "function"
        ? toBigNum(pattern.patternCurrencyReward(raw, state))
        : oneBigNum();

    let currentMultiplier = roundMultiplierBigNum(toBigNum(result.currentMultiplier ?? result.baseMultiplier));
    let currentPatternCurrencyReward = roundMultiplierBigNum(toBigNum(result.currentPatternCurrencyReward ?? basePatternCurrencyReward));

    if (source === "auto") {
      currentMultiplier = scaleAutomationMultiplier(
        currentMultiplier,
        automationConfig.patternMultiplierFactor
      );
      currentPatternCurrencyReward = multiplyBigNumByNumber(
        currentPatternCurrencyReward,
        automationConfig.patternCurrencyFactor
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

  const baseRollValue = toBigNum(value);
  const upgradeEffects = getUpgradeConfig(state, {
    raw,
    value,
    digitCount,
    matches,
    source
  });

  const preMultiplierFlatBonus = toBigNum(upgradeEffects.preMultiplierFlatBonus);
  const modifiedBaseValue = addBigNum(baseRollValue, preMultiplierFlatBonus);
  const patternMultiplier = roundMultiplierBigNum(getPatternMultiplier(matches));

  let globalMultiplier = includeGlobal
    ? toBigNum(upgradeEffects.globalMultiplier)
    : oneBigNum();

  if (source === "auto") {
    globalMultiplier = scaleAutomationMultiplier(
      globalMultiplier,
      automationConfig.globalMultiplierFactor
    );
  }

  const postMultiplierFlatBonus = includePostMultiplierFlatBonus
    ? toBigNum(upgradeEffects.postMultiplierFlatBonus)
    : zeroBigNum();

    // General calculation of roll value is given by
    // totalGain = ((preMultFlat + rollValue) x patternMult x globalMult) + postMultFlat
    const totalMultiplier = roundMultiplierBigNum(multiplyBigNum(patternMultiplier, globalMultiplier));
    const multipliedGain = multiplyBigNum(modifiedBaseValue, totalMultiplier);
    const totalGain = addBigNum(multipliedGain, postMultiplierFlatBonus);
    // const totalGain = makeBigNum(3.26, 1533453348); // For cheating!!

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
    if (state.automation.pauseAutomationOnManualRoll) {
      state.automation.pauseRemainingMs = 5000;
      state.automation.accumulatorMs = 0;
    }
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

// The next few functions control how main tree upgrades affect roll calculations
// Increases the raw value of a roll before multipliers
function getPreMultiplierFlatBonus(state, rollData) {
  let bonus = zeroBigNum();
  bonus = addBigNum(bonus, multiplyBigNumByNumber(oneBigNum(), 250 * getUpgradeLevel(state, "MULT030401")));
  bonus = addBigNum(bonus, multiplyBigNumByNumber(oneBigNum(), 1250 * getUpgradeLevel(state, "MULT030402")));
  return bonus;
}

// Increases the global multiplier
function getGlobalMultiplier(state, rollData) {
  let multiplier = oneBigNum();
  multiplier = addBigNum(
    multiplier,
    multiplyBigNumByNumber(oneBigNum(), 0.2 * getUpgradeLevel(state, "MULT030301"))
  );
  return multiplier;
}

// Increases the raw value of a roll after multipliers
function getPostMultiplierFlatBonus(state, rollData) {
  let bonus = zeroBigNum();
  bonus = addBigNum(bonus, multiplyBigNumByNumber(oneBigNum(), 10000 * getUpgradeLevel(state, "MULT030403")));
  bonus = addBigNum(bonus, multiplyBigNumByNumber(oneBigNum(), 50000 * getUpgradeLevel(state, "MULT030404")));
  return bonus;
}

// Generates a random roll string
function generateRollString(digitCount) {
  let result = "";

  for (let i = 0; i < digitCount; i++) {
    let digit = randomInt(0, 9);

    if (i === 0 && digitCount > 1) {
      digit = randomInt(1, 9);
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