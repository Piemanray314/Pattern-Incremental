import { PATTERNS } from "../data/patterns.js";
import { numberStringToValue } from "./patternHelpers.js";
import { pushRollHistory } from "./statsHelpers.js";
import { getUpgradeLevel, hasUpgrade } from "./upgradeHelpers.js";

export function performRoll(state) {
  const digitCount = state.progression.maxDigitsUnlocked;
  const raw = generateRollString(digitCount);

  const rollResult = evaluateRollString(state, raw, {
    includeGlobal: true,
    includePostMultiplierFlatBonus: true,
    includePatternCurrency: true
  });

  applyRollResult(state, rollResult);
  return rollResult;
}

export function evaluateRollString(
  state,
  raw,
  {
    includeGlobal = true,
    includePostMultiplierFlatBonus = true,
    includePatternCurrency = true
  } = {}
) {
  const digitCount = raw.length;
  const value = numberStringToValue(raw);

  const matches = [];

  for (const pattern of PATTERNS) {
    if (!pattern.visibleWhen(state)) continue;
    if (!pattern.unlockedWhen(state)) continue;

    const result = pattern.evaluate(raw, state);
    if (!result) continue;

    const basePatternCurrencyReward =
      typeof pattern.patternCurrencyReward === "function"
        ? pattern.patternCurrencyReward(raw, state)
        : 1;

    const currentPatternCurrencyReward =
      result.currentPatternCurrencyReward ?? basePatternCurrencyReward;

    matches.push({
      patternId: pattern.id,
      patternName: pattern.name,
      description: pattern.description,
      highlightedIndices: result.highlightedIndices,
      baseMultiplier: result.baseMultiplier,
      currentMultiplier: result.currentMultiplier ?? result.baseMultiplier,
      basePatternCurrencyReward,
      currentPatternCurrencyReward
    });
  }

  const baseRollValue = value;

  const preMultiplierFlatBonus = getPreMultiplierFlatBonus(state, {
    raw,
    value,
    digitCount,
    matches
  });

  const modifiedBaseValue = baseRollValue + preMultiplierFlatBonus;
  const patternMultiplier = getPatternMultiplier(matches);

  const globalMultiplier = includeGlobal
    ? getGlobalMultiplier(state, {
        raw,
        value,
        digitCount,
        matches,
        baseRollValue,
        preMultiplierFlatBonus,
        modifiedBaseValue
      })
    : 1;

  const postMultiplierFlatBonus = includePostMultiplierFlatBonus
    ? getPostMultiplierFlatBonus(state, {
        raw,
        value,
        digitCount,
        matches,
        baseRollValue,
        preMultiplierFlatBonus,
        modifiedBaseValue,
        patternMultiplier,
        globalMultiplier
      })
    : 0;

  const totalMultiplier = patternMultiplier * globalMultiplier;
  const multipliedGain = modifiedBaseValue * totalMultiplier;
  const totalGain = multipliedGain + postMultiplierFlatBonus;

  const totalPatternCurrencyGain = includePatternCurrency
    ? getTotalPatternCurrencyGain(matches)
    : 0;

  return {
    raw,
    value,
    digitCount,
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

    totalPatternCurrencyGain
  };
}

function applyRollResult(state, rollResult) {
  state.currentRoll = rollResult;
  state.currencies.points += rollResult.totalGain;
  state.currencies.patterns += rollResult.totalPatternCurrencyGain;

  state.stats.totalRolls += 1;
  state.stats.lifetimePointsGained += rollResult.totalGain;
  state.stats.lifetimePatternCurrency += rollResult.totalPatternCurrencyGain;
  state.stats.bestRollValue = Math.max(state.stats.bestRollValue, rollResult.value);
  state.stats.bestGain = Math.max(state.stats.bestGain, rollResult.totalGain);

  pushRollHistory(state, rollResult);
}

function getPatternMultiplier(matches) {
  let product = 1;

  for (const match of matches) {
    product *= match.currentMultiplier;
  }

  return product;
}

function getTotalPatternCurrencyGain(matches) {
  let total = 0;

  for (const match of matches) {
    total += match.currentPatternCurrencyReward ?? 0;
  }

  return total;
}

function getPreMultiplierFlatBonus(state, rollData) {
  let bonus = 0;
  bonus += 250 * getUpgradeLevel(state, "MULT030401");
  bonus += 1250 * getUpgradeLevel(state, "MULT030402");
  return bonus;
}

function getGlobalMultiplier(state, rollData) {
  let bonus = 1;
  return bonus;
}

function getPostMultiplierFlatBonus(state, rollData) {
  let bonus = 0;
  bonus += 10000 * getUpgradeLevel(state, "MULT030403");
  bonus += 50000 * getUpgradeLevel(state, "MULT030404");
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