import { createElement } from "../utils/dom.js";
import { formatMultiplier, formatNumber } from "../utils/format.js";

export function renderStatsTab(state) {
  const fragment = document.createDocumentFragment();

  const generalPanel = createElement("section", { className: "panel" });
  generalPanel.append(
    createElement("h2", { className: "panel-title", text: "Statistics" })
  );

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
  breakdownPanel.append(
    createElement("h2", { className: "panel-title", text: "Current Roll Breakdown" })
  );

  if (!state.currentRoll) {
    breakdownPanel.append(
      createElement("div", { className: "muted", text: "No roll yet." })
    );
  } else {
    const breakdownList = createElement("div", { className: "stats-list" });

    breakdownList.append(
      statRow("Roll", state.currentRoll.raw),
      statRow("Base Roll Value", formatNumber(state.currentRoll.baseRollValue)),
      statRow("Pre-Multiplier Flat Bonus", formatNumber(state.currentRoll.preMultiplierFlatBonus)),
      statRow("Modified Base Value", formatNumber(state.currentRoll.modifiedBaseValue)),
      statRow("Pattern Multiplier", formatMultiplier(state.currentRoll.patternMultiplier)),
      statRow("Global Multiplier", formatMultiplier(state.currentRoll.globalMultiplier)),
      statRow("Total Multiplier", formatMultiplier(state.currentRoll.totalMultiplier)),
      statRow("Multiplied Gain", formatNumber(state.currentRoll.multipliedGain)),
      statRow("Post-Multiplier Flat Bonus", formatNumber(state.currentRoll.postMultiplierFlatBonus)),
      statRow("Pattern Currency Gain", formatNumber(state.currentRoll.totalPatternCurrencyGain)),
      statRow("Final Gain", formatNumber(state.currentRoll.totalGain))
    );

    breakdownPanel.append(breakdownList);
  }

  const historyPanel = createElement("section", { className: "panel" });
  historyPanel.append(
    createElement("h2", { className: "panel-title", text: "Previous 10 Rolls" })
  );

  const historyList = createElement("div", { className: "history-list" });

  if (state.stats.previousRolls.length === 0) {
    historyList.append(
      createElement("div", { className: "muted", text: "No history yet." })
    );
  } else {
    for (const roll of state.stats.previousRolls) {
      historyList.append(
        createElement("div", {
          className: "history-item",
          text:
            `${roll.raw} | ` +
            `Pattern ${formatMultiplier(roll.patternMultiplier)} | ` +
            `Global ${formatMultiplier(roll.globalMultiplier)} | ` +
            `Total ${formatMultiplier(roll.multiplier)} | ` +
            `+${formatNumber(roll.gain)} points`
        })
      );
    }
  }

  historyPanel.append(historyList);

  fragment.append(generalPanel, breakdownPanel, historyPanel);
  return fragment;
}

function statRow(label, value) {
  const row = createElement("div", { className: "stat-row" });
  row.append(
    createElement("div", { text: label }),
    createElement("div", { text: value })
  );
  return row;
}