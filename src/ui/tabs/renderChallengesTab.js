import { createElement } from "../../utils/dom.js";
import { CHALLENGES_MAIN } from "../../data/challenges/challengesMain.js";
import {
  claimChallengeReward,
  exitChallengeRun,
  getActiveChallenge,
  getChallengeElapsedMs,
  getChallengeGoalPoints,
  isChallengeClaimable,
  startChallengeRun
} from "../../core/helpers/challengeHelpers.js";
import { formatNumber } from "../../utils/format.js";

let challengeSetState = null;
let headerStatusHost = null;
let headerActionsHost = null;
let headerExitButton = null;
let headerClaimButton = null;
let headerAutoExitButton = null;
const challengeCardRefs = new Map();

// Renders the Challenges tab and initializes persistent UI hosts
export function renderChallengesTab(state, setState) {
  challengeSetState = setState;
  challengeCardRefs.clear();

  const fragment = document.createDocumentFragment();

  const headerPanel = createElement("section", { className: "panel" });
  headerPanel.append(createElement("h2", { className: "panel-title", text: "Challenges" }));
  headerStatusHost = createElement("div", { className: "muted", text: "" });
  headerActionsHost = createElement("div", { className: "roll-actions" });
  headerActionsHost.style.marginTop = "10px";
  headerAutoExitButton = createElement("button", {
    text: "Auto exit complete challenges: OFF",
    onClick: () => {
      challengeSetState((draft) => {
        draft.challenges.autoExitOnComplete = !draft.challenges.autoExitOnComplete;
      }, { topbar: false, content: false, sidebar: false });
    }
  });
  headerExitButton = createElement("button", {
    text: "Exit Challenge",
    onClick: () => {
      challengeSetState((draft) => {
        exitChallengeRun(draft);
      }, { topbar: true, content: false, sidebar: false });
    }
  });
  headerClaimButton = createElement("button", {
    text: "Exit + Claim Reward",
    onClick: () => {
      challengeSetState((draft) => {
        claimChallengeReward(draft);
      }, { topbar: true, content: false, sidebar: false });
    }
  });
  headerActionsHost.append(headerAutoExitButton, headerExitButton, headerClaimButton);
  headerPanel.append(headerStatusHost, headerActionsHost);

  const gridPanel = createElement("section", { className: "panel" });
  gridPanel.append(
    createElement("div", {
      className: "muted",
      text: "Select a challenge to start. Runtime envelope is active; individual challenge rules/rewards are next."
    })
  );
  gridPanel.append(createElement("div", { className: "section-spacer" }));

  const grid = createElement("div", { className: "challenge-grid" });
  for (const challenge of CHALLENGES_MAIN) {
    const card = buildChallengeCard(challenge, state);
    grid.append(card.root);
    challengeCardRefs.set(challenge.id, card);
  }
  gridPanel.append(grid);

  fragment.append(headerPanel, gridPanel);
  refreshChallengesTabLiveContent(state);

  return fragment;
}

// Refreshes challenge header and card state without rebuilding the DOM
export function refreshChallengesTabLiveContent(state) {
  if (!challengeSetState) return;
  if (state.ui.activeTab !== "challenges") return;

  refreshHeader(state);
  refreshCards(state);
}

// Creates one challenge card and stores refs used for incremental updates
function buildChallengeCard(challenge, state) {
  const root = createElement("div", { className: "challenge-card" });
  const title = createElement("div", { className: "challenge-title", text: challenge.title });
  const desc = createElement("div", { className: "challenge-desc", text: challenge.description });
  const goal = createElement("div", { className: "challenge-goal", text: "" });
  const progress = createElement("div", { className: "challenge-progress", text: "" });
  const effect = createElement("div", { className: "challenge-progress muted", text: "" });
  const button = createElement("button", {
    text: "Start",
    onClick: () => {
      challengeSetState((draft) => {
        handleChallengeButtonPress(draft, challenge.id);
      }, { topbar: true, content: false, sidebar: false });
    }
  });

  root.append(title, desc, goal, progress, effect, button);

  return {
    root,
    goal,
    progress,
    effect,
    button
  };
}

// Updates top header status and action buttons
function refreshHeader(state) {
  if (!headerStatusHost || !headerActionsHost) return;

  const activeChallenge = getActiveChallenge(state);
  if (headerAutoExitButton) {
    headerAutoExitButton.textContent = `Auto exit complete challenges: ${state.challenges.autoExitOnComplete ? "ON" : "OFF"}`;
  }

  if (!activeChallenge) {
    headerStatusHost.textContent = "You are not currently in a challenge.";
    if (headerExitButton) headerExitButton.style.display = "none";
    if (headerClaimButton) headerClaimButton.style.display = "none";
    return;
  }

  const elapsedSeconds = Math.floor(getChallengeElapsedMs(state) / 1000);
  headerStatusHost.textContent =
    `Currently in challenge: ${activeChallenge.title} | ` +
    `Time in challenge: ${formatElapsed(elapsedSeconds)}`;

  if (headerExitButton) headerExitButton.style.display = "inline-flex";
  if (headerClaimButton) {
    headerClaimButton.style.display = isChallengeClaimable(state) ? "inline-flex" : "none";
  }
}

// Updates all challenge cards (goal/progress/button state) incrementally
function refreshCards(state) {
  for (const challenge of CHALLENGES_MAIN) {
    const refs = challengeCardRefs.get(challenge.id);
    if (!refs) continue;

    const completions = state.challenges.completions?.[challenge.id] ?? 0;
    const maxCompletions = challenge.maxCompletions ?? 1;
    const activeChallengeId = state.challenges.activeChallengeId;
    const claimableChallengeId = isChallengeClaimable(state) ? activeChallengeId : null;
    const isActive = activeChallengeId === challenge.id;
    const isClaimable = claimableChallengeId === challenge.id;
    const isMaxed = maxCompletions !== Infinity && completions >= maxCompletions;

    refs.goal.textContent = `Goal: ${formatNumber(getChallengeGoalPoints(state, challenge))} points`;
    refs.progress.textContent = maxCompletions === Infinity
      ? `Completions: ${completions}`
      : `Completions: ${completions}/${maxCompletions}`;
    refs.effect.textContent =
      typeof challenge.effectText === "function"
        ? `Effect: ${challenge.effectText(state, completions)}`
        : "";
    refs.button.textContent = getChallengeButtonText({ isActive, isClaimable, isMaxed });
    refs.button.disabled = isMaxed && !isActive && !isClaimable;
  }
}

// Handles Start/Exit/Claim flow for one challenge
function handleChallengeButtonPress(state, challengeId) {
  const activeChallengeId = state.challenges.activeChallengeId;
  const claimableChallengeId = isChallengeClaimable(state) ? activeChallengeId : null;

  if (claimableChallengeId === challengeId) {
    claimChallengeReward(state);
    return;
  }

  if (activeChallengeId === challengeId) {
    exitChallengeRun(state);
    return;
  }

  startChallengeRun(state, challengeId);
}

// Returns the proper button label for one challenge card
function getChallengeButtonText({ isActive, isClaimable, isMaxed }) {
  if (isClaimable) return "Claim";
  if (isActive) return "Exit";
  if (isMaxed) return "Completed";
  return "Start";
}

// Formats seconds to M:SS for challenge elapsed text
function formatElapsed(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
