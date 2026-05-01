import { createElement } from "../../utils/dom.js";
import { saveSubtab } from "../../state/uiState.js";
import { PIE_TIER_NAMES, PIE_TIER_ORDER, buyPieTierMax, buyPieTierOne, ensurePieFactoryState, getInvestmentEffectData, getPieTierDisplayData, getRebakeEffectData, getSacrificeEffectData, investCastedPies, rebakePies, sacrificePies } from "../../core/helpers/pieFactoryHelpers.js";
import { formatMultiplier, formatNumber } from "../../utils/format.js";
import { compareBigNum, roundSmallToWholeMantissa, zeroBigNum } from "../../utils/bigNum.js";
import { renderTreeView } from "../renderTreeView.js";
import { PIE_UPGRADES } from "../../data/pieupgrades/pieUpgradesMain.js";

let pieFactorySetState = null;
let pieFactoryOverviewRefs = null;

// Renders Pie Factory tab with overview and upgrades subtabs
export function renderPieFactoryTab(state, setState) {
  pieFactorySetState = setState;
  ensurePieFactoryState(state);

  const fragment = document.createDocumentFragment();

  const subtabs = [
    { id: "overview", label: "Overview" },
    { id: "upgrades", label: "Upgrades" }
  ];

  const activeSubtab = subtabs.some((item) => item.id === state.ui.pieFactorySubtab)
    ? state.ui.pieFactorySubtab
    : "overview";

  const subtabBar = createElement("div", { className: "roll-actions" });

  for (const tab of subtabs) {
    const button = createElement("button", {
      text: tab.label,
      onClick: () => {
        pieFactorySetState((draft) => {
          draft.ui.pieFactorySubtab = tab.id;
        }, { topbar: false, content: true, sidebar: false });

        saveSubtab("pieFactorySubtab", tab.id);
      }
    });

    if (tab.id === activeSubtab) {
      button.style.borderColor = "var(--accent)";
    }

    subtabBar.append(button);
  }

  fragment.append(subtabBar);
  fragment.append(createElement("div", { className: "section-spacer" }));

  if (activeSubtab === "upgrades") {
    pieFactoryOverviewRefs = null;
    fragment.append(
      renderTreeView({
        state,
        setState,
        title: "Pie Upgrades",
        definitions: PIE_UPGRADES,
        stateKey: "pieUpgrades",
        viewStateKey: "pieUpgradeTreeView"
      })
    );
    return fragment;
  }

  fragment.append(renderPieFactoryOverview(state));
  refreshPieFactoryTabLiveContent(state);

  return fragment;
}

// Refreshes overview-only live values without rebuilding DOM
export function refreshPieFactoryTabLiveContent(state) {
  if (!pieFactoryOverviewRefs) return;
  if (state.ui.activeTab !== "pieFactory") return;
  const pieFactorySubtab = state.ui.pieFactorySubtab ?? "overview";
  if (pieFactorySubtab !== "overview") return;

  ensurePieFactoryState(state);

  pieFactoryOverviewRefs.piesValue.textContent = `${formatNumber(roundSmallToWholeMantissa(state.currencies.pies))} Pies`;
  pieFactoryOverviewRefs.castedPiesValue.textContent =
    `Casted Pies: ${formatNumber(state.pieFactory.castedPies)}`;

  for (const tierId of PIE_TIER_ORDER) {
    const rowRefs = pieFactoryOverviewRefs.tierRows.get(tierId);
    if (!rowRefs) continue;

    const tierIndex = PIE_TIER_ORDER.indexOf(tierId);
    const previousTierId = tierIndex > 0 ? PIE_TIER_ORDER[tierIndex - 1] : null;
    const previousTierData = previousTierId ? getPieTierDisplayData(state, previousTierId) : null;
    const shouldShow = !previousTierData ||
      compareBigNum(previousTierData.count ?? zeroBigNum(), zeroBigNum()) > 0;

    rowRefs.root.style.display = shouldShow ? "flex" : "none";
    if (!shouldShow) continue;

    const rowData = getPieTierDisplayData(state, tierId);
    rowRefs.tierName.textContent = rowData.name;
    rowRefs.tierLevel.textContent = `Level ${formatNumber(rowData.level)}`;
    rowRefs.countChange.textContent = `+${formatPercent(rowData.countChangePercentPerSecond)}/sec`;
    rowRefs.owned.textContent = `Owned: ${formatNumber(roundSmallToWholeMantissa(rowData.count))}`;
    rowRefs.cost.textContent = formatCostText(rowData.nextLevelCost);
    rowRefs.cost.classList.toggle("pie-factory-tier-cost-affordable", Boolean(rowData.isAffordable));
    rowRefs.cost.classList.toggle("pie-factory-tier-cost-unaffordable", !rowData.isAffordable);
    rowRefs.producing.textContent = buildProducingText(rowData);
  }

  const sacrificeEffectData = getSacrificeEffectData(state);
  pieFactoryOverviewRefs.sacrificeEffect.textContent =
    `Gain ${formatNumber(sacrificeEffectData.gainedCastedPies)} casted pies`;
  pieFactoryOverviewRefs.sacrificeMultiplierEffect.textContent =
    `Increase pie multiplier from casted pies from ${formatMultiplier(sacrificeEffectData.currentPointMultiplier)} to ${formatMultiplier(sacrificeEffectData.projectedPointMultiplier)}`;

  const investmentEffectData = getInvestmentEffectData(state);
  pieFactoryOverviewRefs.investmentEffect.textContent =
    `Increase global tier production from ${formatMultiplier(investmentEffectData.currentMultiplier)} to ${formatMultiplier(investmentEffectData.projectedMultiplier)}`;

  const rebakeEffectData = getRebakeEffectData(state);
  pieFactoryOverviewRefs.rebakeEffect.textContent =
    `Increase Piemen multiplier from ${formatMultiplier(rebakeEffectData.currentMultiplier)} to ${formatMultiplier(rebakeEffectData.projectedMultiplier)}`;
}

function renderPieFactoryOverview(state) {
  const container = createElement("div");

  const headerPanel = createElement("section", { className: "panel pie-factory-header-panel" });
  const piesValue = createElement("div", { className: "pie-factory-pies-value", text: "0 Pies" });
  const castedPiesValue = createElement("div", { className: "pie-factory-casted-value muted", text: "Casted Pies: 0" });
  headerPanel.append(piesValue, castedPiesValue);

  const tiersPanel = createElement("section", { className: "panel" });
  tiersPanel.append(createElement("h2", { className: "panel-title", text: "Pie Tiers" }));

  const rowsHost = createElement("div", { className: "pie-factory-tier-list" });
  const tierRows = new Map();

  for (const tierId of PIE_TIER_ORDER) {
    const row = createElement("div", { className: "pie-factory-tier-row" });

    const info = createElement("div", { className: "pie-factory-tier-info" });
    const topLine = createElement("div", { className: "pie-factory-tier-topline" });
    const nameGroup = createElement("span", { className: "pie-factory-tier-namegroup" });
    const tierName = createElement("span", { className: "pie-factory-tier-title", text: "" });
    const tierLevel = createElement("span", { className: "pie-factory-tier-level", text: "" });
    const countChange = createElement("span", { className: "pie-factory-tier-change", text: "" });
    const owned = createElement("span", { className: "pie-factory-tier-owned", text: "" });
    const cost = createElement("span", { className: "pie-factory-tier-cost", text: "" });

    nameGroup.append(tierName, tierLevel);
    topLine.append(nameGroup, countChange, owned);

    const producing = createElement("div", { className: "pie-factory-tier-producing", text: "" });
    info.append(topLine, producing);

    const costColumn = createElement("div", { className: "pie-factory-tier-cost-column" });
    costColumn.append(cost);

    const actions = createElement("div", { className: "pie-factory-tier-actions" });

    const buyOneButton = createElement("button", {
      text: "Buy 1",
      onClick: () => {
        pieFactorySetState((draft) => {
          buyPieTierOne(draft, tierId);
        }, { topbar: true, content: false, sidebar: false });

        refreshPieFactoryTabLiveContent(state);
      }
    });

    const buyMaxButton = createElement("button", {
      text: "Buy Max",
      onClick: () => {
        pieFactorySetState((draft) => {
          buyPieTierMax(draft, tierId);
        }, { topbar: true, content: false, sidebar: false });

        refreshPieFactoryTabLiveContent(state);
      }
    });

    actions.append(buyOneButton, buyMaxButton);

    row.append(info, costColumn, actions);
    rowsHost.append(row);

    tierRows.set(tierId, {
      root: row,
      tierName,
      tierLevel,
      countChange,
      owned,
      cost,
      producing
    });
  }

  tiersPanel.append(rowsHost);

  const actionsPanel = createElement("section", { className: "panel" });
  actionsPanel.append(createElement("h2", { className: "panel-title", text: "Pie Actions" }));

  const actionsGrid = createElement("div", { className: "pie-factory-actions-grid" });

  const rebakeCard = createElement("div", { className: "challenge-card" });
  const rebakeTitle = createElement("div", { className: "challenge-title", text: "Rebaked Pies" });
  const rebakeDescription = createElement("div", {
    className: "challenge-desc",
    text: "Reset pies to 0 and the count of all unlocked tiers to 1 in exchange of boosting the Piemen multiplier based on the total pies accumulated this Tier Boost"
  });
  const rebakeEffect = createElement("div", { className: "challenge-progress", text: "" });
  const rebakeButton = createElement("button", {
    text: "Rebake",
    onClick: () => {
      pieFactorySetState((draft) => {
        rebakePies(draft);
      }, { topbar: true, content: false, sidebar: false });

      refreshPieFactoryTabLiveContent(state);
    }
  });

  rebakeCard.append(rebakeTitle, rebakeDescription, rebakeEffect, rebakeButton);

  const sacrificeCard = createElement("div", { className: "challenge-card" });
  const sacrificeTitle = createElement("div", { className: "challenge-title", text: "Sacrifice Pies" });
  const sacrificeDescription = createElement("div", {
    className: "challenge-desc",
    text: "Sacrifice all current pies and reset all tiers to baseline in exchange for casted pies"
  });
  const sacrificeEffect = createElement("div", { className: "challenge-progress", text: "" });
  const sacrificeMultiplierEffect = createElement("div", { className: "challenge-progress", text: "" });
  const sacrificeButton = createElement("button", {
    text: "Sacrifice",
    onClick: () => {
      pieFactorySetState((draft) => {
        sacrificePies(draft);
      }, { topbar: true, content: false, sidebar: false });

      refreshPieFactoryTabLiveContent(state);
    }
  });

  sacrificeCard.append(sacrificeTitle, sacrificeDescription, sacrificeEffect, sacrificeMultiplierEffect, sacrificeButton);

  const investmentCard = createElement("div", { className: "challenge-card" });
  const investmentTitle = createElement("div", { className: "challenge-title", text: "Tier Boost" });
  const investmentDescription = createElement("div", {
    className: "challenge-desc",
    text: "Reset casted pies and convert them into a permanent global tier multiplier"
  });
  const investmentEffect = createElement("div", { className: "challenge-progress", text: "" });
  const investmentButton = createElement("button", {
    text: "Invest Casted Pies",
    onClick: () => {
      pieFactorySetState((draft) => {
        investCastedPies(draft);
      }, { topbar: true, content: false, sidebar: false });

      refreshPieFactoryTabLiveContent(state);
    }
  });

  investmentCard.append(investmentTitle, investmentDescription, investmentEffect, investmentButton);

  actionsGrid.append(rebakeCard, sacrificeCard, investmentCard);
  actionsPanel.append(actionsGrid);

  container.append(headerPanel, tiersPanel, actionsPanel);

  pieFactoryOverviewRefs = {
    piesValue,
    castedPiesValue,
    tierRows,
    rebakeEffect,
    sacrificeEffect,
    sacrificeMultiplierEffect,
    investmentEffect
  };

  return container;
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "∞%";
  if (value < 0.01 && value > 0) return "0.01%";
  if (value >= 1000) return `${Math.round(value)}%`;
  return `${Number(value.toFixed(2)).toString()}%`;
}

function buildProducingText(rowData) {
  const targetId = rowData.producingTargetTierId;
  const targetName = targetId === "pies"
    ? "Pies"
    : (PIE_TIER_NAMES[targetId] ?? "Tier");

  return `Producing: ${formatNumber(rowData.producingPerSecond)} ${targetName}/sec`;
}

function formatCostText(cost) {
  if (compareBigNum(cost ?? zeroBigNum(), zeroBigNum()) <= 0) {
    return "Cost: Free";
  }

  return `Cost: ${formatNumber(cost)} pies`;
}
