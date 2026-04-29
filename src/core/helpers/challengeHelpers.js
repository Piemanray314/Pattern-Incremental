import { CHALLENGES_MAIN } from "../../data/challenges/challengesMain.js";
import { performCast } from "./castingHelpers.js";
import { toBigNum } from "../../utils/bigNum.js";

const CHALLENGE_PHASE_IDLE = "idle";
const CHALLENGE_PHASE_RUNNING = "running";
const CHALLENGE_PHASE_CLAIMABLE = "claimable";

// Returns a challenge definition by its ID
export function getChallengeById(challengeId) {
  return CHALLENGES_MAIN.find((challenge) => challenge.id === challengeId) ?? null;
}

// Returns the currently active challenge definition
export function getActiveChallenge(state) {
  return getChallengeById(state.challenges.activeChallengeId);
}

// Returns true when a challenge run is currently in progress
export function isChallengeRunning(state) {
  return state.challenges.phase === CHALLENGE_PHASE_RUNNING;
}

// Returns true when the active challenge can be claimed
export function isChallengeClaimable(state) {
  return state.challenges.phase === CHALLENGE_PHASE_CLAIMABLE;
}

// Returns elapsed milliseconds for the current challenge run
export function getChallengeElapsedMs(state) {
  if (!state.challenges.activeChallengeId) return 0;
  return Math.max(0, state.challenges.challengeElapsedMs ?? 0);
}

// Returns the current points goal for a challenge based on completion count
export function getChallengeGoalPoints(state, challenge) {
  const completionCount = state.challenges?.completions?.[challenge.id] ?? 0;

  if (Array.isArray(challenge.goalPointsByCompletion) && challenge.goalPointsByCompletion.length > 0) {
    const clampedIndex = Math.max(0, Math.min(completionCount, challenge.goalPointsByCompletion.length - 1));
    return toBigNum(challenge.goalPointsByCompletion[clampedIndex]);
  }

  return toBigNum(challenge.goalPoints ?? 0);
}

// Returns a short description of challenge and restrictions
export function getActiveChallengeRestrictionText(state) {
  const challenge = getActiveChallenge(state);
  if (!challenge) return "";

  if (challenge.id === "CHAL00100") {
    const maxRolls = challenge.maxRolls ?? 10;
    const rolls = state.challenges.manualRollClicksThisRun ?? 0;
    return `Currently in the Little Giants Challenge | Rolls: ${rolls}/${maxRolls}`;
  }

  if (challenge.id === "CHAL00101") {
    const completionCount = state.challenges?.completions?.[challenge.id] ?? 0;
    const limitSeconds = getValueByCompletion(challenge.timeLimitSecondsByCompletion, completionCount) ?? 60;
    const elapsedSeconds = Math.floor((state.challenges?.challengeElapsedMs ?? 0) / 1000);
    return `Currently in the Speedrun Challenge | Time: ${elapsedSeconds}s/${limitSeconds}s`;
  }

  return `Currently in the ${challenge.title} Challenge.`;
}

// Returns true if auto-roll should be blocked by the active challenge
export function isAutoRollBlockedByChallenge(state) {
  const challenge = getActiveChallenge(state);
  if (!challenge) return false;
  return Boolean(challenge.disableAutomationRolls);
}

// Returns true while Naked challenge restrictions should apply
export function isNakedChallengeActive(state) {
  return state.challenges?.activeChallengeId === "CHAL00102";
}

// Returns non-stacking Naked reward multiplier from completions
export function getNakedPatternCurrencyMultiplier(state) {
  const completions = state.challenges?.completions?.["CHAL00102"] ?? 0;
  if (completions <= 0) return 1;

  const values = [2, 5, 25, 250, 7500];
  const index = Math.max(0, Math.min(completions - 1, values.length - 1));
  return values[index];
}

// Starts a challenge run by recasting and entering challenge restrictions
export function startChallengeRun(state, challengeId) {
  const challenge = getChallengeById(challengeId);
  if (!challenge) return false;
  if (state.challenges.activeChallengeId) return false;
  if (isChallengeMaxed(state, challenge)) return false;
  const keptCompletions = cloneState(state.challenges.completions ?? {});
  performCast(state, { switchToCastingTab: false });
  state.challenges.completions = keptCompletions;

  state.challenges.activeChallengeId = challengeId;
  state.challenges.startedAtMs = Date.now();
  state.challenges.challengeElapsedMs = 0;
  state.challenges.manualRollClicksThisRun = 0;
  state.challenges.phase = CHALLENGE_PHASE_RUNNING;
  state.challenges.claimableChallengeId = null;

  challenge.onEnter(state, getChallengeContext(state, challenge));

  return true;
}

// Exits the current challenge without granting a completion
export function exitChallengeRun(state) {
  if (!state.challenges.activeChallengeId) return false;

  clearChallengeRuntime(state);
  return true;
}

// Claims the active challenge reward and ends the current challenge
export function claimChallengeReward(state) {
  const challengeId = state.challenges.activeChallengeId;
  if (!challengeId) return false;
  if (!isChallengeClaimable(state)) return false;
  const activeChallenge = getChallengeById(challengeId);
  if (!activeChallenge) return false;

  const completions = state.challenges.completions ?? {};
  completions[challengeId] = (completions[challengeId] ?? 0) + 1;
  state.challenges.completions = completions;
  clearChallengeRuntime(state);

  return true;
}

// Evaluates fail/goal transitions
export function updateChallengeRuntime(state, deltaMs = 0) {
  const activeChallenge = getActiveChallenge(state);
  if (!activeChallenge) return;
  if (!isChallengeRunning(state) && !isChallengeClaimable(state)) return;

  state.challenges.challengeElapsedMs = Math.max(
    0,
    (state.challenges.challengeElapsedMs ?? 0) + Math.max(0, deltaMs)
  );

  const context = getChallengeContext(state, activeChallenge);
  if (isChallengeRunning(state)) {
    activeChallenge.onTick(state, context);
  }

  if (activeChallenge.isFailed(state, context)) {
    clearChallengeRuntime(state);
    return;
  }

  if (activeChallenge.isGoalMet(state, context)) {
    if (state.challenges.autoExitOnComplete) {
      state.challenges.phase = CHALLENGE_PHASE_CLAIMABLE;
      state.challenges.claimableChallengeId = activeChallenge.id;
      claimChallengeReward(state);
      return;
    }

    state.challenges.phase = CHALLENGE_PHASE_CLAIMABLE;
    state.challenges.claimableChallengeId = activeChallenge.id;
  }
}

// Clears in-run challenge metadata
function clearChallengeRuntime(state) {
  state.challenges.activeChallengeId = null;
  state.challenges.startedAtMs = null;
  state.challenges.challengeElapsedMs = 0;
  state.challenges.manualRollClicksThisRun = 0;
  state.challenges.phase = CHALLENGE_PHASE_IDLE;
  state.challenges.claimableChallengeId = null;
}

// Returns contextual runtime data passed to challenge hooks
function getChallengeContext(state, challenge) {
  return {
    challenge,
    elapsedMs: getChallengeElapsedMs(state)
  };
}

// Returns current completion-tier value from a list
function getValueByCompletion(list, completionCount) {
  if (!Array.isArray(list) || list.length === 0) return null;
  const clampedIndex = Math.max(0, Math.min(completionCount, list.length - 1));
  return list[clampedIndex];
}

// Returns true when a challenge has reached its completion cap
function isChallengeMaxed(state, challenge) {
  if ((challenge.maxCompletions ?? 1) === Infinity) return false;
  const current = state.challenges.completions?.[challenge.id] ?? 0;
  return current >= (challenge.maxCompletions ?? 1);
}

// Clones challenge-related state safely
function cloneState(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}
