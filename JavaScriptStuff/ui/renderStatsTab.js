import { createElement } from "../utils/dom.js";
import { formatMultiplier, formatNumber } from "../utils/format.js";

export function renderStatsTab(state) {
  const fragment = document.createDocumentFragment();
  const focusRoll = state.latestRoll ?? state.currentRoll;

  const generalPanel = createElement("section", { className: "panel" });
  generalPanel.append(createElement("h2", { className: "panel-title", text: "Statistics" }));

  const statsList = createElement("div", { className: "stats-list" });
  const elapsedMs = Date.now() - state.stats.totalTimeStartedAt;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  statsList.append(
    statRow("Total Rolls", formatNumber(state.stats.totalRolls)),
    statRow("Time Elapsed", `${elapsedSeconds} seconds`),
    statRow("Best Roll Value", formatNumber(state.stats.bestRollValue)),
    statRow("Best Gain", formatNumber(state.stats.bestGain)),
    statRow("Lifetime Points Gained", formatNumber(state.stats.lifetimePointsGained)),
    statRow("Lifetime Patterns Gained", formatNumber(state.stats.lifetimePatternCurrency))
  );

  generalPanel.append(statsList);

  const breakdownPanel = createElement("section", { className: "panel" });
  breakdownPanel.append(createElement("h2", { className: "panel-title", text: "Latest Roll Breakdown" }));

  if (!focusRoll) {
    breakdownPanel.append(createElement("div", { className: "muted", text: "No roll yet." }));
  } else {
    const breakdownList = createElement("div", { className: "stats-list" });
    breakdownList.append(
      statRow("Roll", focusRoll.raw),
      statRow("Source", focusRoll.source === "auto" ? "Auto" : "Manual"),
      statRow("Base Roll Value", formatNumber(focusRoll.baseRollValue)),
      statRow("Pre-Multiplier Flat Bonus", formatNumber(focusRoll.preMultiplierFlatBonus)),
      statRow("Modified Base Value", formatNumber(focusRoll.modifiedBaseValue)),
      statRow("Pattern Multiplier", formatMultiplier(focusRoll.patternMultiplier)),
      statRow("Global Multiplier", formatMultiplier(focusRoll.globalMultiplier)),
      statRow("Total Multiplier", formatMultiplier(focusRoll.totalMultiplier)),
      statRow("Multiplied Gain", formatNumber(focusRoll.multipliedGain)),
      statRow("Post-Multiplier Flat Bonus", formatNumber(focusRoll.postMultiplierFlatBonus)),
      statRow("Pattern Currency Gain", formatNumber(focusRoll.totalPatternCurrencyGain)),
      statRow("Final Gain", formatNumber(focusRoll.totalGain))
    );
    breakdownPanel.append(breakdownList);
  }

  const historyPanel = createElement("section", { className: "panel" });
  historyPanel.append(createElement("h2", { className: "panel-title", text: "Previous 10 Rolls" }));

  const historyList = createElement("div", { className: "history-list" });

  if (state.stats.previousRolls.length === 0) {
    historyList.append(createElement("div", { className: "muted", text: "No history yet." }));
  } else {
    for (const roll of state.stats.previousRolls) {
      historyList.append(renderStoredRollSummary(roll));
    }
  }

  historyPanel.append(historyList);

  fragment.append(generalPanel, breakdownPanel, historyPanel);
  return fragment;
}

function renderStoredRollSummary(roll) {
  return createElement("div", {
    className: "history-item",
    text:
      `${roll.raw} | ` +
      `Value ${formatNumber(roll.modifiedBaseValue ?? roll.value)} | ` +
      `Pattern ${formatMultiplier(roll.patternMultiplier)} | ` +
      `Global ${formatMultiplier(roll.globalMultiplier)} | ` +
      `Total ${formatMultiplier(roll.totalMultiplier ?? roll.multiplier)} | ` +
      `+${formatNumber(roll.totalGain ?? roll.gain)} points` +
      (roll.outdated ? " | Outdated roll - may not be accurate" : "")
  });
}

function statRow(label, value) {
  const row = createElement("div", { className: "stat-row" });
  row.append(
    createElement("div", { text: label }),
    createElement("div", { text: value })
  );
  return row;
}
