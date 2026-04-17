import { createElement } from "../utils/dom.js";
import { formatNumber } from "../utils/format.js";

export function renderTopbar(state, setState) {
  const topbar = createElement("div", { className: "topbar" });

  const left = createElement("div", { className: "topbar-left" });
  const right = createElement("div", { className: "topbar-right" });

  left.append(
    currencyPill(`Points: ${formatNumber(state.currencies.points)}`),
    currencyPill(`Patterns: ${formatNumber(state.currencies.patterns)}`),
    currencyPill(`Pies: ${formatNumber(state.currencies.pies)}`)
  );

  const settingsButton = createElement("button", {
    text: "Settings",
    onClick: () => {
      if (state.ui.activeTab === "settings") return;

      setState((draft) => {
        draft.ui.activeTab = "settings";
      }, { topbar: false, content: true, sidebar: true });
    }
  });

  right.append(
    settingsButton,
    topbarLink("GitHub", "#"),
    topbarLink("Discord", "#"),
    topbarLink("Channel", "#")
  );

  topbar.append(left, right);
  return topbar;
}

function currencyPill(text) {
  return createElement("div", { className: "currency-pill", text });
}

function topbarLink(text, href) {
  const link = createElement("a", { className: "topbar-link", text });
  link.href = href;
  link.target = "_blank";
  return link;
}