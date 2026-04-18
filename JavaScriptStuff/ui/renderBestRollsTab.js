import { createElement } from "../utils/dom.js";
import { formatMultiplier, formatNumber } from "../utils/format.js";

export function renderBestRollsTab(state) {
  const panel = createElement("section", { className: "panel" });
  panel.append(createElement("h2", { className: "panel-title", text: "Best Rolls" }));

  const list = createElement("div", { className: "history-list" });

  if (state.stats.bestRolls.length === 0) {
    list.append(createElement("div", { className: "muted", text: "No best rolls recorded yet." }));
  } else {
    for (const roll of state.stats.bestRolls) {
      list.append(
        createElement("div", {
          className: "history-item",
          text:
            `${roll.raw} | ` +
            `${roll.source === "auto" ? "Auto" : "Manual"} | ` +
            `Base ${formatNumber(roll.modifiedBaseValue)} | ` +
            `Pattern ${formatMultiplier(roll.patternMultiplier)} | ` +
            `Global ${formatMultiplier(roll.globalMultiplier)} | ` +
            `Total ${formatMultiplier(roll.multiplier)} | ` +
            `+${formatNumber(roll.gain)} points`
        })
      );
    }
  }

  panel.append(list);
  return panel;
}
