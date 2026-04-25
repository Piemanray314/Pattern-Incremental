import { compareBigNum, toBigNum } from "../../utils/bigNum.js";

// Updates the 10 most recent rolls with a new roll
export function pushRollHistory(state, rollResult) {
  state.stats.previousRolls.unshift(makeRollSnapshot(rollResult));

  if (state.stats.previousRolls.length > 10) {
    state.stats.previousRolls.length = 10;
  }
}

// Updates the top 20 best rolls with a new roll
export function pushBestRoll(state, rollResult) {
  const snapshot = makeRollSnapshot(rollResult);

  state.stats.bestRolls.push(snapshot);
  state.stats.bestRolls.sort((a, b) =>
    -compareBigNum(toBigNum(a.totalGain), toBigNum(b.totalGain))
  );

  if (state.stats.bestRolls.length > 20) {
    state.stats.bestRolls.length = 20;
  }

  if (state.stats.selectedBestRollIndex >= state.stats.bestRolls.length) {
    state.stats.selectedBestRollIndex = 0;
  }

  return state.stats.bestRolls.some((entry) =>
    entry.raw === snapshot.raw &&
    compareBigNum(toBigNum(entry.totalGain), toBigNum(snapshot.totalGain)) === 0 &&
    compareBigNum(
      toBigNum(entry.totalMultiplier),
      toBigNum(snapshot.totalMultiplier)
    ) === 0
  );
}

// Returns the comprehensive information of a given roll
function makeRollSnapshot(rollResult) {
  return {
    raw: rollResult.raw,
    source: rollResult.source ?? "manual",

    value: rollResult.value,
    baseRollValue: rollResult.baseRollValue,
    preMultiplierFlatBonus: rollResult.preMultiplierFlatBonus,
    modifiedBaseValue: rollResult.modifiedBaseValue,

    patternMultiplier: rollResult.patternMultiplier,
    globalMultiplier: rollResult.globalMultiplier,
    castingMultiplier: rollResult.castingMultiplier,
    totalMultiplier: rollResult.totalMultiplier,

    postMultiplierFlatBonus: rollResult.postMultiplierFlatBonus,
    multipliedGain: rollResult.multipliedGain,
    totalGain: rollResult.totalGain,
    totalPatternCurrencyGain: rollResult.totalPatternCurrencyGain,

    matches: (rollResult.matches ?? []).map((match) => ({
      patternId: match.patternId,
      patternName: match.patternName,
      description: match.description,
      highlightedIndices: Array.isArray(match.highlightedIndices)
        ? [...match.highlightedIndices]
        : [],
      baseMultiplier: match.baseMultiplier,
      currentMultiplier: match.currentMultiplier,
      basePatternCurrencyReward: match.basePatternCurrencyReward,
      currentPatternCurrencyReward: match.currentPatternCurrencyReward
    })),

    // Backward compatability
    gain: rollResult.totalGain,
    multiplier: rollResult.totalMultiplier
  };
}