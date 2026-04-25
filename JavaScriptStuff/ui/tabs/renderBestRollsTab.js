import { createElement } from "../../utils/dom.js";
import { formatMultiplier, formatNumber } from "../../utils/format.js";

export function renderBestRollsTab(state, setState) {
  const fragment = document.createDocumentFragment();
  const bestRolls = state.stats.bestRolls ?? [];

  const selectedIndex = Math.min(
    state.stats.selectedBestRollIndex ?? 0,
    Math.max(0, bestRolls.length - 1)
  );

  const selectedRoll = bestRolls[selectedIndex] ?? null;

  const breakdownPanel = createElement("section", { className: "panel" });
  breakdownPanel.append(
    createElement("h2", { className: "panel-title", text: "Selected Roll Breakdown" })
  );

  if (!selectedRoll) {
    breakdownPanel.append(
      createElement("div", { className: "muted", text: "No best rolls recorded yet." })
    );
  } else {
    breakdownPanel.append(
      createElement("div", {
        className: "current-roll-big",
        text: selectedRoll.raw
      })
    );

    const summary = createElement("div", { className: "roll-summary" });
    summary.append(
      summaryPill(`Roll: ${selectedRoll.raw}`),
      summaryPill(`Pre-Bonus: +${formatNumber(selectedRoll.preMultiplierFlatBonus)}`),
      summaryPill(`Modified Base: ${formatNumber(selectedRoll.modifiedBaseValue)}`),
      summaryPill(`Pattern Multiplier: ${formatMultiplier(selectedRoll.patternMultiplier)}`),
      summaryPill(`Global Multiplier: ${formatMultiplier(selectedRoll.globalMultiplier)}`)
    );
    if (state.progression.castingUnlocked) {
      summary.append(summaryPill(`Casting Multiplier: ${formatMultiplier(selectedRoll.castingMultiplier ?? 1)}`));
    }
    summary.append(summaryPill(`Final Value: ${formatNumber(selectedRoll.totalGain)}`));

    if (selectedRoll.outdated) {
      breakdownPanel.append(
        createElement("div", {
          className: "muted",
          text: "Outdated roll - may not be accurate"
        })
      );
    }

    breakdownPanel.append(createElement("div", { className: "section-spacer" }));
    breakdownPanel.append(summary);

    const matchesPanel = createElement("div", { className: "match-list" });

    if (!Array.isArray(selectedRoll.matches) || selectedRoll.matches.length === 0) {
      matchesPanel.append(
        createElement("div", {
          className: "muted",
          text: "This roll does not have stored pattern breakdown data yet."
        })
      );
    } else {
      for (const match of selectedRoll.matches) {
        matchesPanel.append(renderMatchRow(selectedRoll.raw, match));
      }
    }

    breakdownPanel.append(createElement("div", { className: "section-spacer" }));
    breakdownPanel.append(matchesPanel);
  }

  const listPanel = createElement("section", { className: "panel" });
  listPanel.append(
    createElement("h2", { className: "panel-title", text: "Best 20 Rolls" })
  );

  const list = createElement("div", { className: "history-list" });

  if (bestRolls.length === 0) {
    list.append(
      createElement("div", { className: "muted", text: "No best rolls recorded yet." })
    );
  } else {
    bestRolls.forEach((roll, index) => {
      const button = createElement("button", {
        className: "history-item",
        onClick: () => {
          setState((draft) => {
            draft.stats.selectedBestRollIndex = index;
          }, { topbar: false, content: true, sidebar: false });
        }
      });

      button.style.textAlign = "left";
      button.style.width = "100%";

      const prefix = index === selectedIndex ? "▶ " : "";
      
      if (state.progression.castingUnlocked) {
        button.textContent =
          `${prefix}${roll.raw} | ` +
          `${roll.source === "auto" ? "Auto" : "Manual"} | ` +
          `Value ${formatNumber(roll.modifiedBaseValue ?? roll.value)} | ` +
          `Pattern ${formatMultiplier(roll.patternMultiplier)} | ` +
          `Global ${formatMultiplier(roll.globalMultiplier)} | ` +
          `Casting ${formatMultiplier(roll.castingMultiplier)} | ` +
          `Total ${formatMultiplier(roll.totalMultiplier ?? roll.multiplier)} | ` +
          `+${formatNumber(roll.totalGain ?? roll.gain)} points` +
          (roll.outdated ? " | Outdated roll - may not be accurate" : "");
      } else {
        button.textContent =
          `${prefix}${roll.raw} | ` +
          `${roll.source === "auto" ? "Auto" : "Manual"} | ` +
          `Value ${formatNumber(roll.modifiedBaseValue ?? roll.value)} | ` +
          `Pattern ${formatMultiplier(roll.patternMultiplier)} | ` +
          `Global ${formatMultiplier(roll.globalMultiplier)} | ` +
          `Total ${formatMultiplier(roll.totalMultiplier ?? roll.multiplier)} | ` +
          `+${formatNumber(roll.totalGain ?? roll.gain)} points` +
          (roll.outdated ? " | Outdated roll - may not be accurate" : "");
      }

      list.append(button);
    });
  }

  listPanel.append(list);

  fragment.append(breakdownPanel, listPanel);
  return fragment;
}

function renderMatchRow(rollString, match) {
  const row = createElement("div", { className: "match-row" });
  const digitRow = createElement("div", { className: "digit-row" });

  [...rollString].forEach((digit, index) => {
    const highlighted = Array.isArray(match.highlightedIndices)
      ? match.highlightedIndices.includes(index)
      : false;

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
    text: `(+${formatNumber(match.currentPatternCurrencyReward ?? 0)} patterns)`
  });
  rewardText.style.marginLeft = "20px";

  nameCell.append(nameText, rewardText);
  row.append(digitRow, multiplierCell, nameCell);

  return row;
}

function summaryPill(text) {
  return createElement("div", { className: "summary-pill", text });
}