import { compareBigNum, cloneBigNum } from "../utils/bigNum.js";

export function pushRollHistory(state, rollResult) {
  state.stats.previousRolls.unshift(makeStoredRollEntry(rollResult));

  if (state.stats.previousRolls.length > 10) {
    state.stats.previousRolls.length = 10;
  }
}

export function pushBestRoll(state, rollResult) {
  const entry = makeStoredRollEntry(rollResult);
  const list = state.stats.bestRolls;

  list.push(entry);
  list.sort((a, b) => compareBigNum(b.gain, a.gain));

  let entered = false;
  const matchingIndex = list.findIndex((item) => item.timestamp === entry.timestamp);
  if (matchingIndex !== -1 && matchingIndex < 20) {
    entered = true;
  }

  if (list.length > 20) {
    list.length = 20;
  }

  return entered;
}

function makeStoredRollEntry(rollResult) {
  return {
    raw: rollResult.raw,
    source: rollResult.source,
    value: rollResult.value,
    modifiedBaseValue: rollResult.modifiedBaseValue,
    gain: cloneBigNum(rollResult.totalGain),
    multipliedGain: cloneBigNum(rollResult.multipliedGain),
    multiplier: rollResult.totalMultiplier,
    patternMultiplier: rollResult.patternMultiplier,
    globalMultiplier: rollResult.globalMultiplier,
    preMultiplierFlatBonus: rollResult.preMultiplierFlatBonus,
    postMultiplierFlatBonus: rollResult.postMultiplierFlatBonus,
    patternCurrencyGain: rollResult.totalPatternCurrencyGain,
    timestamp: Date.now() + Math.random()
  };
}
