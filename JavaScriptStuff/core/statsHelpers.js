export function pushRollHistory(state, rollResult) {
  state.stats.previousRolls.unshift({
    raw: rollResult.raw,
    value: rollResult.value,
    gain: rollResult.totalGain,
    multiplier: rollResult.totalMultiplier,
    patternMultiplier: rollResult.patternMultiplier,
    globalMultiplier: rollResult.globalMultiplier,
    preMultiplierFlatBonus: rollResult.preMultiplierFlatBonus,
    postMultiplierFlatBonus: rollResult.postMultiplierFlatBonus,
    patternCurrencyGain: rollResult.totalPatternCurrencyGain
  });

  if (state.stats.previousRolls.length > 10) {
    state.stats.previousRolls.length = 10;
  }
}