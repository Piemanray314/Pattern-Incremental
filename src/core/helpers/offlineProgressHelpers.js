import { updateGame } from "../gameLoop.js";
import { compareBigNum, subtractBigNum, zeroBigNum } from "../../utils/bigNum.js";
import { getUpgradeLevel } from "./upgradeHelpers.js";

export const MIN_OFFLINE_MS = 10_000;
export const DEFAULT_OFFLINE_TICK_MS = 1000;
export const MAX_OFFLINE_TICKS = 10_000;
const OFFLINE_BATCH_SIZE = 100;

// Calculates how long the player was offline
export function getOfflineElapsedMs(state) {
  const lastSavedAt = state.meta.lastSavedAt ?? Date.now();
  return Math.max(0, Date.now() - lastSavedAt);
}

// Returns maxed offline time (with upgrades)
export function getCappedOfflineElapsedMs(state, elapsedMs) {
  const maxAwayMs = getMaxOfflineMs(state);
  return Math.min(elapsedMs, maxAwayMs);
}

// Calculates and returns the max offline time away
export function getMaxOfflineMs(state) {
  const level = getUpgradeLevel(state, "PRES020000", "castingUpgrades") ?? 0;

  if (level >= 4) return Number.POSITIVE_INFINITY;
  if (level === 3) return 24 * 60 * 60 * 1000;
  if (level === 2) return 6 * 60 * 60 * 1000;
  return 60 * 60 * 1000;
}

// Dynamic tick calculation
// Tick length is 1 second until 10000 ticks, in which it turns to offline time / 10000 instead
export function getOfflineTickPlan(elapsedMs) {
  if (elapsedMs < MIN_OFFLINE_MS) {
    return {
      shouldRun: false,
      tickMs: DEFAULT_OFFLINE_TICK_MS,
      totalTicks: 0
    };
  }

  const totalOneSecondTicks = Math.floor(elapsedMs / DEFAULT_OFFLINE_TICK_MS);

  if (totalOneSecondTicks <= MAX_OFFLINE_TICKS) {
    return {
      shouldRun: true,
      tickMs: DEFAULT_OFFLINE_TICK_MS,
      totalTicks: totalOneSecondTicks
    };
  }

  return {
    shouldRun: true,
    tickMs: elapsedMs / MAX_OFFLINE_TICKS,
    totalTicks: MAX_OFFLINE_TICKS
  };
}

// Snapshots values shown on the result screen
export function snapshotOfflineProgress(state) {
  return {
    points: state.currencies.points,
    patterns: state.currencies.patterns,
    casts: state.currencies.casts,
    shards: state.currencies.shards,
    pies: state.currencies.pies,
    totalRolls: state.stats.totalRolls,
    totalCasts: state.stats.totalCasts
  };
}

// Returns rows whose values changed
export function getOfflineProgressChanges(before, after) {
  const rows = [];

  addBigNumChange(rows, "Points", before.points, after.points);
  addBigNumChange(rows, "Patterns", before.patterns, after.patterns);
  addBigNumChange(rows, "Casts", before.casts, after.casts);
  addBigNumChange(rows, "Shards", before.shards, after.shards);
  addBigNumChange(rows, "Pies", before.pies, after.pies);

  addNumberChange(rows, "Total Rolls", before.totalRolls, after.totalRolls);
  addNumberChange(rows, "Total Casts", before.totalCasts, after.totalCasts);

  return rows;
}

function addBigNumChange(rows, label, before, after) {
  if (compareBigNum(after ?? zeroBigNum(), before ?? zeroBigNum()) === 0) return;

  rows.push({
    label,
    before,
    after
  });
}

function addNumberChange(rows, label, before, after) {
  if ((before ?? 0) === (after ?? 0)) return;

  rows.push({
    label,
    before,
    after
  });
}

// Starts offline progress UI state
export function beginOfflineProgress(state, elapsedMs) {
  const cappedElapsedMs = getCappedOfflineElapsedMs(state, elapsedMs);
  const plan = getOfflineTickPlan(cappedElapsedMs);

  if (!plan.shouldRun) return false;

  state.ui.offlineProgress = {
    active: true,
    complete: false,
    elapsedMs: cappedElapsedMs,
    tickMs: plan.tickMs,
    totalTicks: plan.totalTicks,
    ticksDone: 0,
    before: snapshotOfflineProgress(state),
    after: null,
    calculatedRolls: 0
  };

  return true;
}

// Runs one async batch and returns true if complete
// async means it always returns a promise and can use "await" to pause the function
// It can run and pause without pausing the rest of the program! やったー！
export async function runOfflineProgressBatch(state) {
  const offline = state.ui.offlineProgress;
  if (!offline?.active || offline.complete) return true;

  const ticksLeft = offline.totalTicks - offline.ticksDone;
  const ticksThisBatch = Math.min(OFFLINE_BATCH_SIZE, ticksLeft);

  const rollsBefore = state.stats.totalRolls;

  for (let i = 0; i < ticksThisBatch; i++) {
    updateGame(state, offline.tickMs);
    offline.ticksDone += 1;
  }

  offline.calculatedRolls += Math.max(0, state.stats.totalRolls - rollsBefore);

  if (offline.ticksDone >= offline.totalTicks) {
    completeOfflineProgress(state);
    return true;
  }

  await new Promise((resolve) => setTimeout(resolve, 0));
  return false;
}

// Skips 10% of remaining ticks multiplicatively
export function skipOfflineProgressPercent(state, percent = 0.1) {
  const offline = state.ui.offlineProgress;
  if (!offline?.active || offline.complete) return;

  const remaining = offline.totalTicks - offline.ticksDone;
  const skipped = Math.ceil(remaining * percent);

  offline.ticksDone = Math.min(offline.totalTicks, offline.ticksDone + skipped);

  if (offline.ticksDone >= offline.totalTicks) {
    completeOfflineProgress(state);
  }
}

// Skips all remaining ticks
export function skipAllOfflineProgress(state) {
  const offline = state.ui.offlineProgress;
  if (!offline?.active || offline.complete) return;

  offline.ticksDone = offline.totalTicks;
  completeOfflineProgress(state);
}

// Finishes offline progress and records result snapshot
export function completeOfflineProgress(state) {
  const offline = state.ui.offlineProgress;
  if (!offline) return;

  offline.complete = true;
  offline.after = snapshotOfflineProgress(state);
  state.meta.lastSavedAt = Date.now();
}

// Resets complete offline modal
export function closeOfflineProgress(state) {
  state.ui.offlineProgress = {
    active: false,
    complete: false,
    elapsedMs: 0,
    tickMs: DEFAULT_OFFLINE_TICK_MS,
    totalTicks: 0,
    ticksDone: 0,
    before: null,
    after: null,
    calculatedRolls: 0
  };
}
