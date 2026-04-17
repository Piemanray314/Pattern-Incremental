export function updateGame(state, deltaMs) {
  const instructions = {
    topbar: false,
    content: false,
    sidebar: false
  };

  state.timers.uiRefreshAccumulatorMs += deltaMs;

  if (
    state.ui.activeTab === "stats" &&
    state.timers.uiRefreshAccumulatorMs >= 1000
  ) {
    state.timers.uiRefreshAccumulatorMs = 0;
    instructions.content = true;
  }

  // Future auto-roll example:
  // state.timers.autoRollAccumulatorMs += deltaMs;
  // if (state.auto.rollEnabled && state.timers.autoRollAccumulatorMs >= 1000) {
  //   state.timers.autoRollAccumulatorMs -= 1000;
  //   performRoll(state);
  //   instructions.topbar = true;
  //   if (state.ui.activeTab === "roll") {
  //     instructions.content = true;
  //   }
  // }

  return instructions;
}