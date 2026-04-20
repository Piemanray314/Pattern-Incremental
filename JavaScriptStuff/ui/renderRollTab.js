import { createElement } from "../utils/dom.js";
import { formatMultiplier, formatNumber } from "../utils/format.js";
import { performRoll } from "../core/rollEngine.js";
import { getAutomationConfig } from "../core/automationHelpers.js";

export function renderRollTab(state, setState) {
  const container = document.createDocumentFragment();
  const displayedRoll = state.currentRoll;
  const automationConfig = getAutomationConfig(state);

  const actionsPanel = createElement("section", { className: "panel" });
  actionsPanel.append(
    createElement("h2", { className: "panel-title", text: "Actions" })
  );

  const actions = createElement("div", { className: "roll-actions" });

  const rollButton = createElement("button", {
    text: "Roll",
    onClick: () => {
      setState((draft) => {
        performRoll(draft, { source: "manual" });
      }, { topbar: true, content: true, sidebar: false });
    }
  });

  actions.append(rollButton);
  actionsPanel.append(actions);

  const statusText = createElement("div", {
    className: "muted",
    text: buildAutomationStatusText(state, automationConfig)
  });
  statusText.style.marginTop = "12px";
  actionsPanel.append(statusText);

  const currentRollPanel = createElement("section", { className: "panel" });
  currentRollPanel.append(
    createElement("h2", { className: "panel-title", text: "Displayed Roll" })
  );

  if (!displayedRoll) {
    currentRollPanel.append(
      createElement("div", { className: "muted", text: "No roll yet." })
    );
  } else {
    currentRollPanel.append(
      createElement("div", {
        className: "current-roll-big",
        text: displayedRoll.raw
      })
    );

    const summary = createElement("div", { className: "roll-summary" });
    summary.append(
      summaryPill(`Base: ${formatNumber(displayedRoll.baseRollValue)}`),
      summaryPill(`Value: ${formatNumber(displayedRoll.modifiedBaseValue)}`),
      summaryPill(`Multiplier: ${formatMultiplier(displayedRoll.totalMultiplier)}`),
      summaryPill(`Gain: ${formatNumber(displayedRoll.totalGain)}`),
      summaryPill(`Source: ${displayedRoll.source === "auto" ? "Auto" : "Manual"}`)
    );

    currentRollPanel.append(createElement("div", { className: "section-spacer" }));
    currentRollPanel.append(summary);
  }

  const matchesPanel = createElement("section", { className: "panel" });
  matchesPanel.append(
    createElement("h2", { className: "panel-title", text: "Pattern Matches" })
  );

  const matchList = createElement("div", { className: "match-list" });

  if (!displayedRoll) {
    matchList.append(
      createElement("div", { className: "muted", text: "Roll to see pattern matches." })
    );
  } else {
    for (const match of displayedRoll.matches) {
      matchList.append(renderMatchRow(displayedRoll.raw, match));
    }
  }

  matchesPanel.append(matchList);

  container.append(actionsPanel, currentRollPanel, matchesPanel);
  return container;
}

function renderMatchRow(rollString, match) {
  const row = createElement("div", { className: "match-row" });
  const digitRow = createElement("div", { className: "digit-row" });

  [...rollString].forEach((digit, index) => {
    const highlighted = match.highlightedIndices.includes(index);
    digitRow.append(
      createElement("div", {
        className: `digit-box${highlighted ? " highlight" : ""}`,
        text: digit
      })
    );
  });

  const multiplierCell = createElement("div", {
    text: formatMultiplier(match.currentMultiplier)
  });

  const nameCell = createElement("div");
  const nameText = createElement("span", { text: match.patternName });
  const rewardText = createElement("span", {
    text: `(+${formatNumber(match.currentPatternCurrencyReward)} patterns)`
  });
  rewardText.style.marginLeft = "20px";

  nameCell.append(nameText, rewardText);
  row.append(digitRow, multiplierCell, nameCell);
  return row;
}

function buildAutomationStatusText(state, automationConfig) {
  if (!automationConfig.unlocked) {
    return "Automation is locked.";
  }

  const enabledText = state.automation.enabled ? "ON" : "OFF";

  return `Automation ${enabledText} | Effective interval ${automationConfig.effectiveIntervalMs} ms | Display mode: ${state.automation.displayMode}`;
}

function summaryPill(text) {
  return createElement("div", { className: "summary-pill", text });
}
