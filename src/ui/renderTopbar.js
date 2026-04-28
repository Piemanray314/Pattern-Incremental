import { createElement } from "../utils/dom.js";
import { formatNumber } from "../utils/format.js";
import { roundSmallToWholeMantissa } from "../utils/bigNum.js";

export function renderTopbar(state, setState) {
  const topbar = createElement("div", { className: "topbar" });

  const left = createElement("div", { className: "topbar-left" });
  const right = createElement("div", { className: "topbar-right" });

  const pointsPill = currencyPill("points", `Points: ${formatNumber(state.currencies.points)}`);
  const patternsPill = currencyPill("patterns", `Patterns: ${formatNumber(roundSmallToWholeMantissa(state.currencies.patterns))}`);
  const castsPill = currencyPill("casts", `Casts: ${formatNumber(roundSmallToWholeMantissa(state.currencies.casts))}`);
  const shardsPill = currencyPill("shards", `Shards: ${formatNumber(roundSmallToWholeMantissa(state.currencies.shards))}`);
  const piesPill = currencyPill("pies", `Pies: ${formatNumber(state.currencies.pies)}`);
  pointsPill.dataset.currencyKey = "points";
  patternsPill.dataset.currencyKey = "patterns";
  castsPill.dataset.currencyKey = "casts";
  shardsPill.dataset.currencyKey = "shards";
  piesPill.dataset.currencyKey = "pies";

  left.append(pointsPill, patternsPill, castsPill, shardsPill, piesPill);

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
    topbarLink("GitHub", "https://github.com/Piemanray314/Pattern-Incremental"),
    topbarLink("Discord", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    topbarLink("Channel", "https://www.youtube.com/@Piemanray314")
  );

  topbar.append(left, right);
  return topbar;
}

function currencyPill(key, text) {
  return createElement("div", {
    className: "currency-pill",
    text,
    dataset: { currencyKey: key }
  });
}

function topbarLink(text, href) {
  const link = createElement("a", { className: "topbar-link", text });
  link.href = href;
  link.target = "_blank";
  return link;
}

export function refreshTopbarCurrencies(state) {
  updateCurrencyPill("points", `Points: ${formatNumber(state.currencies.points)}`);
  updateCurrencyPill("patterns", `Patterns: ${formatNumber(state.currencies.patterns)}`);
  updateCurrencyPill("casts", `Casts: ${formatNumber(state.currencies.casts)}`);
  updateCurrencyPill("shards", `Shards: ${formatNumber(state.currencies.shards)}`);
  updateCurrencyPill("pies", `Pies: ${formatNumber(state.currencies.pies)}`);
}

function updateCurrencyPill(key, text) {
  const element = document.querySelector(`[data-currency-key="${key}"]`);
  if (!element) return;
  element.textContent = text;
}