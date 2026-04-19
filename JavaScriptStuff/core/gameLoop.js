import { performRoll } from "./rollEngine.js";
import { getAutomationConfig } from "./automationHelpers.js";

// Main game loop
export function updateGame(state, deltaMs) {
  // Dictates what parts of the UI to re-rendered this frame
  const instructions = {
    topbar: false,
    content: false,
    sidebar: false
  };

  state.timers.uiRefreshAccumulatorMs += deltaMs;

  if (state.automation.pauseRemainingMs > 0) {
    state.automation.pauseRemainingMs = Math.max(0, state.automation.pauseRemainingMs - deltaMs);
  }

  const automationConfig = getAutomationConfig(state);

  if (
    automationConfig.unlocked &&
    state.automation.enabled &&
    state.automation.pauseRemainingMs === 0
  ) {
    state.automation.accumulatorMs += deltaMs;

    const effectiveIntervalMs = automationConfig.effectiveIntervalMs;

    while (state.automation.accumulatorMs >= effectiveIntervalMs) {
      state.automation.accumulatorMs -= effectiveIntervalMs;
      const rollResult = performRoll(state, { source: "auto" });

      instructions.topbar = true;

      if (state.ui.activeTab === "stats" || state.ui.activeTab === "bestRolls") {
        instructions.content = true;
      }

      if (state.ui.activeTab === "roll" && state.currentRoll === rollResult) {
        instructions.content = true;
      }
    }
  }

  // Refreshes the UI at most 4 times a second
  if (
    (state.ui.activeTab === "stats") &&
    state.timers.uiRefreshAccumulatorMs >= 250
  ) {
    state.timers.uiRefreshAccumulatorMs = 0;
    instructions.content = true;
  }

  return instructions;
}
