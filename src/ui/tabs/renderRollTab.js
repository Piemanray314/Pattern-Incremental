import { createElement } from "../../utils/dom.js";
import { formatMultiplier, formatNumber } from "../../utils/format.js";
import { performRoll } from "../../core/rollEngine.js";
import { getAutomationConfig } from "../../core/helpers/automationHelpers.js";
import { canCast, performCast } from "../../core/helpers/castingHelpers.js";
import { compareBigNum, fromNumber } from "../../utils/bigNum.js";
import { hasUpgrade } from "../../core/helpers/upgradeHelpers.js";

const ROLL_RECAST_POINT_REQUIREMENT = fromNumber(1e21);
let rollStatusHost = null;
let rollCurrentRollHost = null;
let rollMatchListHost = null;

export function renderRollTab(state, setState) {
  const container = document.createDocumentFragment();
  const automationConfig = getAutomationConfig(state);

  const actionsPanel = createElement("section", { className: "panel" });
  actionsPanel.append(
    createElement("h2", { className: "panel-title", text: "Actions" })
  );

  const actions = createElement("div", { className: "roll-actions" });

  const rollButton = createElement("button", { text: "Roll" });

  rollButton.addEventListener("click", (event) => {
    let rollResult = null;

    setState((draft) => {
      rollResult = performRoll(draft, { source: "manual" });
    }, { topbar: true, content: false, sidebar: false });

    if (rollResult) {
      spawnRollPopEffect(event, rollButton, rollResult.raw);
    }

    refreshRollTabLiveContent(state);
  });

  actions.append(rollButton);

  if (hasUpgrade(state, "PRES00202", "castingUpgrades")) {
    const canRecastNow = canCast(state) && compareBigNum(state.currencies.points, ROLL_RECAST_POINT_REQUIREMENT) >= 0;

    const recastButton = createElement("button", {
      text: "Recast",
      onClick: () => {
        if (!canCast(state)) {
          window.alert("Recast is not unlocked yet.");
          return;
        }

        if (compareBigNum(state.currencies.points, ROLL_RECAST_POINT_REQUIREMENT) < 0) {
          window.alert("You need at least 1 sextillion points to recast from this panel.");
          return;
        }

        const confirmed = window.confirm("Perform a recast? This will reset most base progress.");
        if (!confirmed) return;

        setState((draft) => {
          performCast(draft);
        }, { topbar: true, content: true, sidebar: true });
      }
    });

    recastButton.disabled = !canRecastNow;
    actions.append(recastButton);
  }

  actionsPanel.append(actions);

  const statusText = createElement("div", { className: "muted", text: "" });
  statusText.style.marginTop = "12px";
  actionsPanel.append(statusText);
  rollStatusHost = statusText;

  const currentRollPanel = createElement("section", { className: "panel" });
  currentRollPanel.append(
    createElement("h2", { className: "panel-title", text: "Displayed Roll" })
  );
  const currentRollHost = createElement("div");
  currentRollPanel.append(currentRollHost);
  rollCurrentRollHost = currentRollHost;

  const matchesPanel = createElement("section", { className: "panel" });
  matchesPanel.append(
    createElement("h2", { className: "panel-title", text: "Pattern Matches" })
  );

  const matchList = createElement("div", { className: "match-list" });
  rollMatchListHost = matchList;

  matchesPanel.append(matchList);

  refreshRollTabLiveContent(state);

  container.append(actionsPanel, currentRollPanel, matchesPanel);
  return container;
}

export function refreshRollTabLiveContent(state) {
  if (rollStatusHost) {
    rollStatusHost.textContent = buildAutomationStatusText(state, getAutomationConfig(state));
  }

  if (rollCurrentRollHost) {
    renderCurrentRollInto(rollCurrentRollHost, state);
  }

  if (rollMatchListHost) {
    renderMatchesInto(rollMatchListHost, state);
  }
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

function formatMultiplierDiceText(roll) {
  const dice = roll.multiplierRolls ?? [];
  if (dice.length === 0) return "";

  return " " + dice.map(die => `x${formatNumber(die.multiplier)}`).join(" ");
}

function renderCurrentRollInto(host, state) {
  host.innerHTML = "";
  const displayedRoll = state.currentRoll;

  if (!displayedRoll) {
    host.append(createElement("div", { className: "muted", text: "No roll yet." }));
    return;
  }

  const rollText = createElement("div", { className: "roll-text" });

  const mainRoll = createElement("span", {
    className: "roll-main",
    text: displayedRoll.raw
  });

  const diceText = createElement("span", {
    className: "roll-multiplier",
    text: formatMultiplierDiceText(displayedRoll)
  });

  rollText.append(mainRoll, diceText);
  host.append(rollText);

  const summary = createElement("div", { className: "roll-summary" });

  summary.append(
    summaryPill(`Value: ${formatNumber(displayedRoll.modifiedBaseValue)}`),
    summaryPill(`Pattern Multiplier: ${formatMultiplier(displayedRoll.patternMultiplier)}`),
    summaryPill(`Global Multiplier: ${formatMultiplier(displayedRoll.globalMultiplier)}`)
  );
  if (state.progression.castingUnlocked) {
    summary.append(
      summaryPill(`Casting Multiplier: ${formatMultiplier(state.currentRoll.castingMultiplier ?? 1)}`)
    );
  }
  if ((displayedRoll.multiplierRolls ?? []).length > 0) {
    summary.append(
      summaryPill(`Multiplier Rolls: ${formatMultiplier(displayedRoll.multiplierRollTotal ?? 1)}`)
    );
  }
  summary.append(
    summaryPill(`Gain: ${formatNumber(displayedRoll.totalGain)}`),
    summaryPill(`Source: ${displayedRoll.source === "auto" ? "Auto" : "Manual"}`)
  );

  host.append(createElement("div", { className: "section-spacer" }));
  host.append(summary);
}

function renderMatchesInto(host, state) {
  host.innerHTML = "";
  const displayedRoll = state.currentRoll;

  if (!displayedRoll) {
    host.append(createElement("div", { className: "muted", text: "Roll to see pattern matches." }));
    return;
  }

  for (const match of displayedRoll.matches) {
    host.append(renderMatchRow(displayedRoll.raw, match));
  }
}

function spawnRollPopEffect(event, button, text) {
  const pop = document.createElement("div");
  pop.className = "roll-pop-text";
  pop.textContent = text;

  const buttonRect = button.getBoundingClientRect();
  const fallbackX = buttonRect.left + buttonRect.width / 2;
  const fallbackY = buttonRect.top + buttonRect.height / 2;

  const x = event?.clientX ?? fallbackX;
  const y = event?.clientY ?? fallbackY;

  let positionX = x;
  let positionY = y;
  let velocityX = (Math.random() - 0.5) * 260;
  let velocityY = -220 - Math.random() * 180;
  const gravity = 620;
  const lifetimeMs = 900;

  pop.style.left = `${positionX}px`;
  pop.style.top = `${positionY}px`;

  document.body.append(pop);

  let startTime = null;
  let lastTime = null;

  function tick(now) {
    if (startTime === null) {
      startTime = now;
      lastTime = now;
    }

    const elapsedMs = now - startTime;
    const deltaSec = Math.max(0, (now - lastTime) / 1000);
    lastTime = now;

    velocityY += gravity * deltaSec;
    positionX += velocityX * deltaSec;
    positionY += velocityY * deltaSec;

    const alpha = Math.max(0, 1 - elapsedMs / lifetimeMs);

    pop.style.left = `${positionX}px`;
    pop.style.top = `${positionY}px`;
    pop.style.opacity = String(alpha);

    if (elapsedMs >= lifetimeMs) {
      pop.remove();
      return;
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
