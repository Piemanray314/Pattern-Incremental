import { AUTOMATION_UPGRADES } from "../data/automationUpgrades.js";
import {
  buyUpgrade,
  canAffordCost,
  getUpgradeLevel,
  getUpgradeCost
} from "../core/upgradeHelpers.js";
import { createElement } from "../utils/dom.js";
import { formatNumber } from "../utils/format.js";

const CARD_WIDTH = 260;
const CARD_HEIGHT = 150;
const GRID_X = 320;
const GRID_Y = 220;
const START_X = 40;
const START_Y = 40;

export function renderAutomationTab(state, setState) {
  const panel = createElement("section", { className: "panel upgrade-tree-panel" });

  const headerRow = createElement("div", { className: "panel-header-row" });
  const title = createElement("h2", { className: "panel-title", text: "Automation Tree" });

  const resetViewButton = createElement("button", {
    text: "Reset View",
    onClick: () => {
      setState((draft) => {
        draft.ui.automationTreeView = {
          scrollLeft: 0,
          scrollTop: 0
        };
      }, { topbar: false, content: true, sidebar: false });
    }
  });

  headerRow.append(title, resetViewButton);
  panel.append(headerRow);

  const scrollHost = createElement("div");
  scrollHost.style.overflow = "auto";
  scrollHost.style.maxWidth = "100%";
  scrollHost.style.maxHeight = "calc(100vh - 220px)";
  scrollHost.style.cursor = "grab";
  scrollHost.style.userSelect = "none";

  const upgradesToDraw = AUTOMATION_UPGRADES.filter((upgrade) => upgrade.visibleWhen(state));
  const maxX = Math.max(...upgradesToDraw.map((u) => u.x), 0);
  const maxY = Math.max(...upgradesToDraw.map((u) => u.y), 0);

  const canvas = createElement("div", { className: "upgrade-tree-canvas" });
  canvas.style.width = `${START_X * 2 + maxX * GRID_X + CARD_WIDTH}px`;
  canvas.style.height = `${START_Y * 2 + maxY * GRID_Y + CARD_HEIGHT}px`;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "upgrade-connector-layer");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  for (const upgrade of upgradesToDraw) {
    for (const parentId of upgrade.parents ?? []) {
      const parent = upgradesToDraw.find((u) => u.id === parentId);
      if (!parent) continue;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(getNodeCenterX(parent)));
      line.setAttribute("y1", String(getNodeCenterY(parent)));
      line.setAttribute("x2", String(getNodeCenterX(upgrade)));
      line.setAttribute("y2", String(getNodeCenterY(upgrade)));
      line.setAttribute("stroke", "#4b556b");
      line.setAttribute("stroke-width", "3");
      svg.appendChild(line);
    }
  }

  canvas.appendChild(svg);

  for (const upgrade of upgradesToDraw) {
    canvas.appendChild(renderUpgradeCard(state, setState, upgrade));
  }

  scrollHost.appendChild(canvas);
  panel.append(scrollHost);

  restoreScrollPosition(scrollHost, state);
  persistScrollPosition(scrollHost, state);
  enableDragPan(scrollHost, state);

  return panel;
}

function renderUpgradeCard(state, setState, upgrade) {
  const level = getUpgradeLevel(state, upgrade.id, "automationUpgrades");
  const maxLevel = upgrade.maxLevel ?? 1;
  const purchased = level >= maxLevel;
  const cost = getUpgradeCost({ ...state, upgrades: state.automationUpgrades }, { ...upgrade, stateKey: "automationUpgrades" });
  const affordable = canAffordCost(state, cost);
  const requirementsMet = upgrade.canBuyWhen(state);
  const available = !purchased && requirementsMet && affordable;
  const blocked = !purchased && requirementsMet && !affordable;

  let extraClass = "hidden-visible";
  if (purchased) extraClass = "purchased";
  else if (available) extraClass = "available";
  else if (blocked) extraClass = "blocked";

  const card = createElement("div", {
    className: `upgrade-card ${extraClass}`
  });

  card.style.left = `${getNodeX(upgrade)}px`;
  card.style.top = `${getNodeY(upgrade)}px`;

  const top = createElement("div");
  top.append(
    createElement("div", { className: "upgrade-title", text: upgrade.title }),
    createElement("div", { className: "upgrade-desc", text: upgrade.description })
  );

  const footer = createElement("div", { className: "upgrade-footer" });
  footer.append(
    createElement("div", { text: `Cost: ${formatCost(cost)}` }),
    createElement("div", { text: `Quantity: ${level}/${maxLevel}` })
  );

  const button = createElement("button", {
    text: purchased ? "Purchased" : "Buy",
    onClick: () => {
      setState((draft) => {
        buyUpgrade(draft, upgrade.id, AUTOMATION_UPGRADES, "automationUpgrades");
      }, { topbar: true, content: true, sidebar: false });
    }
  });

  button.disabled = purchased || !requirementsMet || !affordable;
  card.append(top, footer, button);
  return card;
}

function restoreScrollPosition(scrollHost, state) {
  const savedView = state.ui.automationTreeView ?? { scrollLeft: 0, scrollTop: 0 };

  requestAnimationFrame(() => {
    scrollHost.scrollLeft = savedView.scrollLeft ?? 0;
    scrollHost.scrollTop = savedView.scrollTop ?? 0;
  });
}

function persistScrollPosition(scrollHost, state) {
  let scrollSaveTimeout = null;

  scrollHost.addEventListener("scroll", () => {
    clearTimeout(scrollSaveTimeout);
    scrollSaveTimeout = setTimeout(() => {
      state.ui.automationTreeView = {
        ...(state.ui.automationTreeView ?? {}),
        scrollLeft: scrollHost.scrollLeft,
        scrollTop: scrollHost.scrollTop
      };
    }, 40);
  });
}

function enableDragPan(scrollHost, state) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startScrollLeft = 0;
  let startScrollTop = 0;
  let moved = false;

  scrollHost.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest("button")) return;

    isDragging = true;
    moved = false;
    startX = event.clientX;
    startY = event.clientY;
    startScrollLeft = scrollHost.scrollLeft;
    startScrollTop = scrollHost.scrollTop;

    scrollHost.style.cursor = "grabbing";
    scrollHost.setPointerCapture(event.pointerId);
  });

  scrollHost.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      moved = true;
    }

    scrollHost.scrollLeft = startScrollLeft - dx;
    scrollHost.scrollTop = startScrollTop - dy;

    state.ui.automationTreeView = {
      ...(state.ui.automationTreeView ?? {}),
      scrollLeft: scrollHost.scrollLeft,
      scrollTop: scrollHost.scrollTop
    };
  });

  const stopDragging = (event) => {
    if (!isDragging) return;

    isDragging = false;
    scrollHost.style.cursor = "grab";

    try {
      scrollHost.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  };

  scrollHost.addEventListener("pointerup", stopDragging);
  scrollHost.addEventListener("pointercancel", stopDragging);

  scrollHost.addEventListener("click", (event) => {
    if (!moved) return;
    event.preventDefault();
    event.stopPropagation();
    moved = false;
  }, true);
}

function formatCost(cost) {
  if (!cost) return "Maxed";

  return Object.entries(cost)
    .map(([currency, amount]) => `${formatNumber(amount)} ${currency}`)
    .join(", ");
}

function getNodeX(upgrade) {
  return START_X + upgrade.x * GRID_X;
}

function getNodeY(upgrade) {
  return START_Y + upgrade.y * GRID_Y;
}

function getNodeCenterX(upgrade) {
  return getNodeX(upgrade) + CARD_WIDTH / 2;
}

function getNodeCenterY(upgrade) {
  return getNodeY(upgrade) + CARD_HEIGHT / 2;
}
