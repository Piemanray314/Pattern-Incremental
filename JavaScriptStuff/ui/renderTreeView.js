import { createElement } from "../utils/dom.js";
import { buyUpgrade, canAffordCost, getUpgradeLevel, getUpgradeCost } from "../core/upgradeHelpers.js";
import { formatNumber } from "../utils/format.js";
import { saveTreeViewPosition } from "../state/uiState.js";

const CARD_WIDTH = 260;
const CARD_HEIGHT = 150;
const GRID_X = 320;
const GRID_Y = 220;
const START_X = 40;
const START_Y = 40;

export function renderTreeView({
  state,
  setState,
  title,
  definitions,
  stateKey,
  viewStateKey,
  resetViewLabel = "Reset View"
}) {
  const panel = createElement("section", { className: "panel upgrade-tree-panel" });

  const headerRow = createElement("div", { className: "panel-header-row" });
  const titleEl = createElement("h2", { className: "panel-title", text: title });

  const resetViewButton = createElement("button", {
    text: resetViewLabel,
    onClick: () => {
      setState((draft) => {
        draft.ui[viewStateKey] = {
          scrollLeft: 0,
          scrollTop: 0
        };
      }, { topbar: false, content: true, sidebar: false });
    }
  });

  headerRow.append(titleEl, resetViewButton);
  panel.append(headerRow);

  const scrollHost = createElement("div");
  scrollHost.style.overflow = "auto";
  scrollHost.style.maxWidth = "100%";
  scrollHost.style.maxHeight = "calc(100vh - 220px)";
  scrollHost.style.cursor = "grab";
  scrollHost.style.userSelect = "none";

  const visibleDefs = definitions.filter((item) => item.visibleWhen(state));

  const bounds = getTreeBounds(visibleDefs);

  const canvas = createElement("div", { className: "upgrade-tree-canvas" });
  canvas.style.width = `${bounds.width}px`;
  canvas.style.height = `${bounds.height}px`;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "upgrade-connector-layer");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  for (const item of visibleDefs) {
    for (const parentId of item.parents ?? []) {
      const parent = visibleDefs.find((u) => u.id === parentId);
      if (!parent) continue;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(getNodeCenterX(parent, bounds.offsetX)));
      line.setAttribute("y1", String(getNodeCenterY(parent, bounds.offsetY)));
      line.setAttribute("x2", String(getNodeCenterX(item, bounds.offsetX)));
      line.setAttribute("y2", String(getNodeCenterY(item, bounds.offsetY)));
      line.setAttribute("stroke", "#4b556b");
      line.setAttribute("stroke-width", "3");

      svg.appendChild(line);
    }
  }

  canvas.appendChild(svg);

  for (const item of visibleDefs) {
    canvas.appendChild(
      renderTreeCard({
        state,
        setState,
        item,
        stateKey,
        offsetX: bounds.offsetX,
        offsetY: bounds.offsetY,
        definitions
      })
    );
  }

  scrollHost.appendChild(canvas);
  panel.append(scrollHost);

  restoreScrollPosition(scrollHost, state, viewStateKey);
  persistScrollPosition(scrollHost, state, viewStateKey);
  enableDragPan(scrollHost, state, viewStateKey);

  return panel;
}

function renderTreeCard({
  state,
  setState,
  item,
  stateKey,
  definitions,
  offsetX,
  offsetY
}) {
  const level = getUpgradeLevel(state, item.id, stateKey);
  const maxLevel = item.maxLevel ?? 1;
  const purchased = level >= maxLevel;
  const cost = getUpgradeCost(state, item, stateKey);
  const affordable = canAffordCost(state, cost);
  const requirementsMet = item.canBuyWhen(state);
  const available = !purchased && requirementsMet && affordable;
  const blocked = !purchased && requirementsMet && !affordable;
  const hiddenVisible = !purchased && !requirementsMet;

  let extraClass = "hidden-visible";
  if (purchased) extraClass = "purchased";
  else if (available) extraClass = "available";
  else if (blocked) extraClass = "blocked";
  else if (hiddenVisible) extraClass = "hidden-visible";

  const typeClass = `type-${getUpgradeType(item.id).toLowerCase()}`;

  const card = createElement("div", {
    className: `upgrade-card ${extraClass} ${typeClass}`
  });

  card.style.left = `${getNodeX(item, offsetX)}px`;
  card.style.top = `${getNodeY(item, offsetY)}px`;

  const top = createElement("div");
  // Piemanray314 <- So I can Ctrl + F this later and hide IDs on release versions :)
  const devView = false;
  if (devView) {
    top.append(
      createElement("div", { className: "upgrade-title", text: `${item.title}, ${item.id}` }),
      createElement("div", { className: "upgrade-desc", text: item.description })
    );
  } else {
    top.append(
      createElement("div", { className: "upgrade-title", text: item.title }),
      createElement("div", { className: "upgrade-desc", text: item.description })
    );
  }

  const footer = createElement("div", { className: "upgrade-footer" });
  if (!purchased && cost) {
    footer.append(
      createElement("div", { text: `Cost: ${formatCost(cost)}` })
    );
  }

  footer.append(
    createElement("div", { text: `Quantity: ${level}/${maxLevel}` })
  );

  const button = createElement("button", {
    text: purchased ? "Purchased" : "Buy",
    onClick: () => {
      setState((draft) => {
        buyUpgrade(draft, item.id, definitions, stateKey);
      }, { topbar: true, content: true, sidebar: false });
    }
  });

  button.disabled = purchased || !requirementsMet || !affordable;

  card.append(top, footer, button);
  return card;
}

function formatCost(cost) {
  if (!cost) return "Maxed";

  return Object.entries(cost)
    .map(([currency, amount]) => `${formatNumber(amount)} ${currency}`)
    .join(", ");
}

function getTreeBounds(definitions) {
  if (definitions.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      offsetX: START_X,
      offsetY: START_Y,
      width: START_X * 2 + CARD_WIDTH,
      height: START_Y * 2 + CARD_HEIGHT
    };
  }

  const minGridX = Math.min(...definitions.map((d) => d.x ?? 0));
  const minGridY = Math.min(...definitions.map((d) => d.y ?? 0));
  const maxGridX = Math.max(...definitions.map((d) => d.x ?? 0));
  const maxGridY = Math.max(...definitions.map((d) => d.y ?? 0));

  const offsetX = START_X + (-Math.min(minGridX, 0)) * GRID_X;
  const offsetY = START_Y + (-Math.min(minGridY, 0)) * GRID_Y;

  const width =
    offsetX +
    (maxGridX + 1) * GRID_X +
    CARD_WIDTH +
    START_X;

  const height =
    offsetY +
    (maxGridY + 1) * GRID_Y +
    CARD_HEIGHT +
    START_Y;

  return {
    minX: minGridX,
    minY: minGridY,
    maxX: maxGridX,
    maxY: maxGridY,
    offsetX,
    offsetY,
    width,
    height
  };
}

function getNodeX(item, offsetX) {
  return offsetX + (item.x ?? 0) * GRID_X;
}

function getNodeY(item, offsetY) {
  return offsetY + (item.y ?? 0) * GRID_Y;
}

function getNodeCenterX(item, offsetX) {
  return getNodeX(item, offsetX) + CARD_WIDTH / 2;
}

function getNodeCenterY(item, offsetY) {
  return getNodeY(item, offsetY) + CARD_HEIGHT / 2;
}

function restoreScrollPosition(scrollHost, state, viewStateKey) {
  const savedView = state.ui[viewStateKey] ?? { scrollLeft: 0, scrollTop: 0 };

  requestAnimationFrame(() => {
    scrollHost.scrollLeft = savedView.scrollLeft ?? 0;
    scrollHost.scrollTop = savedView.scrollTop ?? 0;
  });
}

function persistScrollPosition(scrollHost, state, viewStateKey) {
  let scrollSaveTimeout = null;

  scrollHost.addEventListener("scroll", () => {
    clearTimeout(scrollSaveTimeout);

    scrollSaveTimeout = setTimeout(() => {
      const position = {
        ...(state.ui[viewStateKey] ?? {}),
        scrollLeft: scrollHost.scrollLeft,
        scrollTop: scrollHost.scrollTop
      };

      state.ui[viewStateKey] = position;
      saveTreeViewPosition(viewStateKey, position);
    }, 40);
  });
}

function enableDragPan(scrollHost, state, viewStateKey) {
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

    state.ui[viewStateKey] = {
      ...(state.ui[viewStateKey] ?? {}),
      scrollLeft: scrollHost.scrollLeft,
      scrollTop: scrollHost.scrollTop
    };

    saveTreeViewPosition(viewStateKey, state.ui[viewStateKey]);
  });

  const stopDragging = (event) => {
    if (!isDragging) return;

    isDragging = false;
    scrollHost.style.cursor = "grab";

    try {
      scrollHost.releasePointerCapture(event.pointerId);
    } catch {
      
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

function getUpgradeType(id) {
  const match = String(id).match(/^[A-Z]+/);
  return match ? match[0] : "OTHER";
}