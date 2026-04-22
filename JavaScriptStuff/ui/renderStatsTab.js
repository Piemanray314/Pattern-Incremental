import { createElement } from "../utils/dom.js";
import { formatMultiplier, formatNumber } from "../utils/format.js";

export function renderStatsTab(state) {
  const fragment = document.createDocumentFragment();
  const showCasting = state.progression.castingUnlocked;

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

  if (showCasting) {
    statsList.append(
      statRow("Total Casts", formatNumber(state.stats.totalCasts)),
      statRow("Rolls This Cast", formatNumber(state.stats.rollsThisCast)),
      statRow("Points This Cast", formatNumber(state.stats.pointsThisCast)),
      statRow("Patterns This Cast", formatNumber(state.stats.patternsThisCast))
    );
  }

  generalPanel.append(statsList);

  const historyPanel = createElement("section", { className: "panel" });
  historyPanel.append(createElement("h2", { className: "panel-title", text: "Previous 10 Rolls" }));

  const historyList = createElement("div", { className: "history-list" });

  if (state.stats.previousRolls.length === 0) {
    historyList.append(createElement("div", { className: "muted", text: "No history yet." }));
  } else {
    for (const roll of state.stats.previousRolls) {
      historyList.append(renderStoredRollSummary(roll, showCasting));
    }
  }

  historyPanel.append(historyList);

  const castHistoryPanel = createElement("section", { className: "panel" });
  castHistoryPanel.append(createElement("h2", { className: "panel-title", text: "Previous 10 Casts" }));

  if (showCasting) {
    const castHistoryList = createElement("div", { className: "history-list" });

    if ((state.stats.previousCasts ?? []).length === 0) {
      castHistoryList.append(createElement("div", { className: "muted", text: "No casts yet." }));
    } else {
      for (const cast of state.stats.previousCasts) {
        castHistoryList.append(
          createElement("div", {
            className: "history-item",
            text:
              `${cast.rolls} rolls | ` +
              `${formatNumber(cast.points)} points | ` +
              `${formatNumber(cast.patterns)} patterns | ` +
              `+${formatNumber(cast.castsGained)} Casts | ` +
              `+${formatNumber(cast.shardsGained)} Shards`
          })
        );
      }
    }

    castHistoryPanel.append(castHistoryList);
    fragment.append(generalPanel, historyPanel, castHistoryPanel);
    return fragment;
  }
  fragment.append(generalPanel, historyPanel);
  return fragment;
}

function renderStoredRollSummary(roll, showCasting) {
  if (showCasting) {
    return createElement("div", {
      className: "history-item",
      text:
        `${roll.raw} | ` +
        `Value ${formatNumber(roll.modifiedBaseValue ?? roll.value)} | ` +
        `Pattern ${formatMultiplier(roll.patternMultiplier)} | ` +
        `Global ${formatMultiplier(roll.globalMultiplier)} | ` +
        `Casting ${formatMultiplier(roll.castingMultiplier ?? 1)} | ` +
        `Total ${formatMultiplier(roll.totalMultiplier ?? roll.multiplier)} | ` +
        `+${formatNumber(roll.totalGain ?? roll.gain)} points` +
        (roll.outdated ? " | Outdated roll - may not be accurate" : "")
    });
  }
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
