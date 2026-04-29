import { compareBigNum, toBigNum } from "../../utils/bigNum.js";

// Returns the current goal points for a challenge based on completion count
function getGoalPointsByCompletion(challenge, completionCount) {
  if (Array.isArray(challenge.goalPointsByCompletion) && challenge.goalPointsByCompletion.length > 0) {
    const clampedIndex = Math.max(0, Math.min(completionCount, challenge.goalPointsByCompletion.length - 1));
    return toBigNum(challenge.goalPointsByCompletion[clampedIndex]);
  }

  return toBigNum(challenge.goalPoints ?? 0);
}

// Checks whether the active challenge goal has been reached
function defaultIsGoalMet(state, challenge) {
  const completionCount = state.challenges?.completions?.[challenge.id] ?? 0;
  const goalPoints = getGoalPointsByCompletion(challenge, completionCount);
  return compareBigNum(state.currencies?.points, goalPoints) >= 0;
}

// Builds a challenge definition, filling in defaults if not present
function createChallenge(definition) {
  return {
    maxCompletions: 1,
    onEnter() {},
    onTick() {},
    isFailed() { return false; },
    isGoalMet(state) {
      return defaultIsGoalMet(state, this);
    },
    effectText() { return ""; },
    ...definition
  };
}

// Returns current completion-tier value from a list
function getValueByCompletion(list, completionCount) {
  if (!Array.isArray(list) || list.length === 0) return null;
  const clampedIndex = Math.max(0, Math.min(completionCount, list.length - 1));
  return list[clampedIndex];
}

export const CHALLENGES_MAIN = [
  createChallenge({
    id: "CHAL00100",
    title: "Little Giants",
    description: "Reach the goal in at most 10 rolls. Upon completion, every manual roll will also roll adjacent numbers. Check previous rolls in statistics to view other rolls.",
    x: 0,
    y: 0,
    goalPointsByCompletion: [
      { mantissa: 1, exponent: 24 },
      { mantissa: 1, exponent: 40 },
      { mantissa: 1, exponent: 100 },
      { mantissa: 1, exponent: 250 },
      { mantissa: 1, exponent: 1250 }
    ],
    maxRolls: 10,
    disableAutomationRolls: true,
    maxCompletions: 5,
    onEnter(state) {
      state.automation.accumulatorMs = 0;
    },
    isFailed(state) {
      return (state.challenges?.manualRollClicksThisRun ?? 0) > (this.maxRolls ?? 10);
    },
    effectText(state, completions) {
      const radius = completions <= 0 ? 0 : Math.min(2, completions);
      return `Adjacent roll range: +/-${radius}`;
    }
  }),

  createChallenge({
    id: "CHAL00101",
    title: "Speedrun",
    description: "Reach the goal before the timer runs out. Upon completion, the start of every cast will now have a 'burst automation' mode featuring heavily boosted automation speed for a short time.",
    x: 1,
    y: 0,
    goalPointsByCompletion: [
      { mantissa: 1, exponent: 40 },
      { mantissa: 1, exponent: 100 },
      { mantissa: 1, exponent: 314 },
      { mantissa: 1, exponent: 727 },
      { mantissa: 1, exponent: 1000 }
    ],
    timeLimitSecondsByCompletion: [60, 45, 30, 20, 15],
    maxCompletions: 5,
    isFailed(state) {
      const completionCount = state.challenges?.completions?.[this.id] ?? 0;
      const limitSeconds = getValueByCompletion(this.timeLimitSecondsByCompletion, completionCount) ?? 60;
      return (state.challenges?.challengeElapsedMs ?? 0) > limitSeconds * 1000;
    },
    effectText(state, completions) {
      if (completions <= 0) {
        return "Cast-start burst: none";
      }

      const intervalsMs = [100, 80, 70, 60, 50];
      const durationsSeconds = [5, 6, 7, 8, 10];
      const index = Math.max(0, Math.min(completions - 1, intervalsMs.length - 1));
      return `Cast-start burst: ${intervalsMs[index]}ms for ${durationsSeconds[index]}s`;
    }
  }),

  createChallenge({
    id: "CHAL00102",
    title: "Naked",
    description: "Reach the goal with only base pattern multipliers. Upon completion, pattern currency multipliers will be buffed significantly.",
    x: 2,
    y: 0,
    goalPointsByCompletion: [
      { mantissa: 1, exponent: 35 },
      { mantissa: 1, exponent: 50 },
      { mantissa: 1, exponent: 70 },
      { mantissa: 1, exponent: 100 },
      { mantissa: 1, exponent: 150 }
    ],
    maxCompletions: 5,
    effectText(state, completions) {
      const multipliers = [2, 5, 25, 250, 7500];
      if (completions <= 0) return "Pattern currency multiplier: x1";
      const index = Math.max(0, Math.min(completions - 1, multipliers.length - 1));
      return `Pattern currency multiplier: x${multipliers[index]}`;
    }
  })
];
