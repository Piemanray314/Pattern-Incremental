import { compareBigNum, toBigNum } from "../../utils/bigNum.js";
import { CHAL00101BurstConfig, CHAL00102Multiplier, CHAL00103Multiplier, CHAL00104Multiplier, CHAL00105Multiplier } from "../../core/helpers/challengeUpgradeHelpers.js";
import { formatMultiplier } from "../../utils/format.js";

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

// Challenge IDs are in the form CHAL N XXYY, where N is the type of challenge (main challenges are 0), and XXYY is the position
// Main challenge list
export const CHALLENGES_MAIN = [
  createChallenge({
    id: "CHAL00100",
    title: "Little Giants",
    description: "Reach the goal in at most 10 rolls (Automation disabled). Upon completion, every manual roll will also roll adjacent numbers. Check previous rolls in statistics to view other rolls.",
    x: 0,
    y: 0,
    goalPointsByCompletion: [
      { mantissa: 1, exponent: 28 },
      { mantissa: 1, exponent: 40 },
      { mantissa: 1, exponent: 70 },
      { mantissa: 1, exponent: 120 },
      { mantissa: 1, exponent: 250 }
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
      const radius = completions <= 0 ? 0 : completions;
      return `Adjacent roll range: ±${radius}`;
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
      { mantissa: 1, exponent: 85 },
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
        return "No cast-start burst";
      }

      const burst = CHAL00101BurstConfig(completions);
      return `${burst.intervalMs}ms for ${burst.durationSeconds}s cast-burst start`;
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
      { mantissa: 1, exponent: 75 },
      { mantissa: 1, exponent: 100 },
      { mantissa: 1, exponent: 150 }
    ],
    maxCompletions: 5,
    effectText(state, completions) {
      return `${formatMultiplier(CHAL00102Multiplier(completions))} Pattern currency multiplier`;
    }
  }),

  createChallenge({
    id: "CHAL00103",
    title: "D9",
    description: "Regardless of unlocked digits, rolls are always between 1 and 9 during the challenge. Upon completion, gain a non-stacking global multiplier boost.",
    x: 0,
    y: 1,
    goalPointsByCompletion: [
      { mantissa: 1, exponent: 40 },
      { mantissa: 1, exponent: 70 },
      { mantissa: 1, exponent: 180 },
      { mantissa: 1, exponent: 270 },
      { mantissa: 1, exponent: 500 }
    ],
    maxCompletions: 5,
    effectText(state, completions) {
      const multiplier = CHAL00103Multiplier(completions);
      if (multiplier.exponent === 0) return "No global multiplier boost";
      return `${formatMultiplier(multiplier)} Global multiplier boost`;
    }
  }),

  createChallenge({
    id: "CHAL00104",
    title: "Carpal Tunnel",
    description: "Manual rolls are disabled. Reach the goal using automation only. Upon completion, automation gains pattern currency multipliers at cast start until your first manual roll.",
    x: 1,
    y: 1,
    goalPointsByCompletion: [
      { mantissa: 1, exponent: 70 },
      { mantissa: 1, exponent: 90 },
      { mantissa: 1, exponent: 120 },
      { mantissa: 1, exponent: 180 },
      { mantissa: 1, exponent: 300 }
    ],
    maxCompletions: 5,
    effectText(state, completions) {
      return `${formatMultiplier(CHAL00104Multiplier(completions))} Automation pattern currency multiplier until first manual roll`;
    }
  }),

  createChallenge({
    id: "CHAL00105",
    title: "Amnesia",
    description: "Every roll replaces your current points and patterns with that roll's gains. Upon completion, gain a cast multiplier boost.",
    x: 2,
    y: 1,
    goalPointsByCompletion: [
      { mantissa: 1, exponent: 70 },
      { mantissa: 1, exponent: 100 },
      { mantissa: 1, exponent: 150 },
      { mantissa: 1, exponent: 220 },
      { mantissa: 1, exponent: 400 }
    ],
    maxCompletions: 5,
    effectText(state, completions) {
      return `${formatMultiplier(CHAL00105Multiplier(completions))} Cast multiplier`;
    }
  })
];
