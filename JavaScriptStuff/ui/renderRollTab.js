import { createElement } from "../utils/dom.js";
import { formatMultiplier, formatNumber } from "../utils/format.js";
import { performRoll } from "../core/rollEngine.js";

export function renderRollTab(state, setState) {
  const container = document.createDocumentFragment();

  const actionsPanel = createElement("section", { className: "panel" });
  actionsPanel.append(
    createElement("h2", { className: "panel-title", text: "Actions" })
  );

  const actions = createElement("div", { className: "roll-actions" });

  const rollButton = createElement("button", {
    text: "Roll",
    onClick: () => {
      setState((draft) => {
        performRoll(draft);
      }, { topbar: true, content: true, sidebar: false });
    }
  });

  const multiRollButton = createElement("button", {
    text: "Multi-Roll",
    onClick: () => {
      alert("Not implemented yet.");
    }
  });

  const restrictedRollButton = createElement("button", {
    text: "Range-Restricted Roll",
    onClick: () => {
      alert("Not implemented yet.");
    }
  });

  actions.append(rollButton, multiRollButton, restrictedRollButton);
  actionsPanel.append(actions);

  const currentRollPanel = createElement("section", { className: "panel" });
  currentRollPanel.append(
    createElement("h2", { className: "panel-title", text: "Current Roll" })
  );

  if (!state.currentRoll) {
    currentRollPanel.append(
      createElement("div", { className: "muted", text: "No roll yet." })
    );
  } else {
    currentRollPanel.append(
      createElement("div", {
        className: "current-roll-big",
        text: state.currentRoll.raw
      })
    );

    const summary = createElement("div", { className: "roll-summary" });
    summary.append(
      summaryPill(`Value: ${formatNumber(state.currentRoll.modifiedBaseValue)}`),
      summaryPill(`Multiplier: ${formatMultiplier(state.currentRoll.totalMultiplier)}`),
      summaryPill(`Gain: ${formatNumber(state.currentRoll.totalGain)}`)
    );

    currentRollPanel.append(createElement("div", { className: "section-spacer" }));
    currentRollPanel.append(summary);
  }

  const matchesPanel = createElement("section", { className: "panel" });
  matchesPanel.append(
    createElement("h2", { className: "panel-title", text: "Pattern Matches" })
  );

  const matchList = createElement("div", { className: "match-list" });

  if (!state.currentRoll) {
    matchList.append(
      createElement("div", { className: "muted", text: "Roll to see pattern matches." })
    );
  } else {
    for (const match of state.currentRoll.matches) {
      matchList.append(renderMatchRow(state.currentRoll.raw, match));
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

  const nameText = createElement("span", {
    text: match.patternName
  });

  const rewardText = createElement("span", {
    text: `(+${formatNumber(match.currentPatternCurrencyReward)} patterns)`
  });

  rewardText.style.marginLeft = "20px";

  nameCell.append(nameText, rewardText);

  row.append(digitRow, multiplierCell, nameCell);
  return row;
}

function summaryPill(text) {
  return createElement("div", { className: "summary-pill", text });
}