import { createElement } from "../utils/dom.js";
import { formatNumber } from "../utils/format.js";
import { roundSmallToWholeMantissa } from "../utils/bigNum.js";

export function renderTopbar(state, setState) {
  const topbar = createElement("div", { className: "topbar" });

  const left = createElement("div", { className: "topbar-left" });
  const right = createElement("div", { className: "topbar-right" });

  left.append(
    currencyPill(`Points: ${formatNumber(state.currencies.points)}`),
    currencyPill(`Patterns: ${formatNumber(roundSmallToWholeMantissa(state.currencies.patterns))}`),
    currencyPill(`Pies: ${formatNumber(state.currencies.pies)}`)
  );

  const changeLogButton = createElement("button", {
    text: "Change Log",
    onClick: () => {
      setState((draft) => {
        draft.ui.showChangeLogModal = true;
      }, { topbar: false, content: true, sidebar: false });
    }
  });

  right.append(
    changeLogButton,
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