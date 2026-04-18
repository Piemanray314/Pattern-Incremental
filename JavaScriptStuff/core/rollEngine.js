import { PATTERNS } from "../data/patterns.js";
import { numberStringToValue } from "./patternHelpers.js";
import { pushBestRoll, pushRollHistory } from "./statsHelpers.js";
import { getUpgradeLevel } from "./upgradeHelpers.js";
import { addBigNum, maxBigNum, multiplyBigNum, multiplyBigNumByNumber, subtractBigNum, toBigNum, zeroBigNum, oneBigNum } from "../utils/bigNum.js";
import { getAutomationConfig, shouldDisplayAutoRoll } from "./automationHelpers.js";

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

  const matches = [];

  for (const pattern of PATTERNS) {
    if (!pattern.visibleWhen(state)) continue;
    if (!pattern.unlockedWhen(state)) continue;

    const result = pattern.evaluate(raw, state);
    if (!result) continue;

    const basePatternCurrencyReward =
      typeof pattern.patternCurrencyReward === "function"
        ? toBigNum(pattern.patternCurrencyReward(raw, state))
        : oneBigNum();

    let currentMultiplier = toBigNum(result.currentMultiplier ?? result.baseMultiplier);
    let currentPatternCurrencyReward =
      toBigNum(result.currentPatternCurrencyReward ?? basePatternCurrencyReward);

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
  const preMultiplierFlatBonus = toBigNum(
    getPreMultiplierFlatBonus(state, { raw, value, digitCount, matches, source })
  );

  const modifiedBaseValue = addBigNum(baseRollValue, preMultiplierFlatBonus);
  const patternMultiplier = getPatternMultiplier(matches);

  let globalMultiplier = includeGlobal
    ? toBigNum(getGlobalMultiplier(state, {
        raw,
        value,
        digitCount,
        matches,
        baseRollValue,
        preMultiplierFlatBonus,
        modifiedBaseValue,
        source
      }))
    : oneBigNum();

  if (source === "auto") {
    globalMultiplier = scaleAutomationMultiplier(
      globalMultiplier,
      automationConfig.globalMultiplierFactor
    );
  }

  const postMultiplierFlatBonus = includePostMultiplierFlatBonus
    ? toBigNum(getPostMultiplierFlatBonus(state, {
        raw,
        value,
        digitCount,
        matches,
        baseRollValue,
        preMultiplierFlatBonus,
        modifiedBaseValue,
        patternMultiplier,
        globalMultiplier,
        source
      }))
    : zeroBigNum();

  const totalMultiplier = multiplyBigNum(patternMultiplier, globalMultiplier);
  const multipliedGain = multiplyBigNum(modifiedBaseValue, totalMultiplier);
  const totalGain = addBigNum(multipliedGain, postMultiplierFlatBonus);

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

function getRollDigitCount(state, source) {
  if (source !== "auto") {
    return state.progression.maxDigitsUnlocked;
  }

  const automationConfig = getAutomationConfig(state);
  return Math.max(1, Math.min(automationConfig.digitCap, state.progression.maxDigitsUnlocked));
}

function getPatternMultiplier(matches) {
  let product = oneBigNum();

  for (const match of matches) {
    product = multiplyBigNum(product, match.currentMultiplier);
  }

  return product;
}

function getTotalPatternCurrencyGain(matches) {
  let total = zeroBigNum();

  for (const match of matches) {
    total = addBigNum(total, match.currentPatternCurrencyReward ?? zeroBigNum());
  }

  return total;
}

function scaleAutomationMultiplier(multiplier, factor) {
  const bigMultiplier = toBigNum(multiplier);
  const delta = subtractBigNum(bigMultiplier, oneBigNum());
  const scaledDelta = multiplyBigNumByNumber(delta, factor);
  return addBigNum(oneBigNum(), scaledDelta);
}

function getPreMultiplierFlatBonus(state, rollData) {
  let bonus = zeroBigNum();
  bonus = addBigNum(bonus, multiplyBigNumByNumber(oneBigNum(), 250 * getUpgradeLevel(state, "MULT030401")));
  bonus = addBigNum(bonus, multiplyBigNumByNumber(oneBigNum(), 1250 * getUpgradeLevel(state, "MULT030402")));
  return bonus;
}

function getGlobalMultiplier(state, rollData) {
  let multiplier = oneBigNum();
  multiplier = addBigNum(
    multiplier,
    multiplyBigNumByNumber(oneBigNum(), 0.2 * getUpgradeLevel(state, "MULT030301"))
  );
  return multiplier;
}

function getPostMultiplierFlatBonus(state, rollData) {
  let bonus = zeroBigNum();
  bonus = addBigNum(bonus, multiplyBigNumByNumber(oneBigNum(), 10000 * getUpgradeLevel(state, "MULT030403")));
  bonus = addBigNum(bonus, multiplyBigNumByNumber(oneBigNum(), 50000 * getUpgradeLevel(state, "MULT030404")));
  return bonus;
}

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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}