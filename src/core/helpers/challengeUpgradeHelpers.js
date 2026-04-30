import { toBigNum } from "../../utils/bigNum.js";

// Returns Speedrun cast-start burst config by completion count
export function CHAL00101BurstConfig(completionCount) {
  const intervalsMs = [100, 80, 70, 60, 50];
  const durationsSeconds = [5, 6, 7, 8, 10];

  if (completionCount <= 0) {
    return {
      intervalMs: 0,
      durationSeconds: 0
    };
  }

  const index = Math.max(0, Math.min(completionCount - 1, intervalsMs.length - 1));
  return {
    intervalMs: intervalsMs[index],
    durationSeconds: durationsSeconds[index]
  };
}

// Returns Naked reward multiplier by completion count
export function CHAL00102Multiplier(completionCount) {
  const multipliers = [2, 5, 25, 250, 7500];
  if (completionCount <= 0) return 1;

  const index = Math.max(0, Math.min(completionCount - 1, multipliers.length - 1));
  return multipliers[index];
}

// Returns D9 global multiplier reward by completion count
export function CHAL00103Multiplier(completionCount) {
  const exponents = [3, 8, 15, 30, 50];
  if (completionCount <= 0) return toBigNum(1);

  const index = Math.max(0, Math.min(completionCount - 1, exponents.length - 1));
  return toBigNum({ mantissa: 1, exponent: exponents[index] });
}

// Returns Carpal Tunnel automation pattern currency multiplier by completion count
export function CHAL00104Multiplier(completionCount) {
  const multipliers = [2, 4, 8, 16, 32];
  if (completionCount <= 0) return 1;

  const index = Math.max(0, Math.min(completionCount - 1, multipliers.length - 1));
  return multipliers[index];
}

// Returns Amnesia cast multiplier reward by completion count
export function CHAL00105Multiplier(completionCount) {
  const multipliers = [2, 4, 6, 8, 10];
  if (completionCount <= 0) return 1;

  const index = Math.max(0, Math.min(completionCount - 1, multipliers.length - 1));
  return multipliers[index];
}
