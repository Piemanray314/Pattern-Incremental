import { createElement } from "../../utils/dom.js";
import { getAutomationConfig } from "../../core/helpers/automationHelpers.js";
import { hasUpgrade } from "../../core/helpers/upgradeHelpers.js";

const AUTO_RECAST_CONDITIONS = [
  { id: "shards", label: "X shards achieved" },
  { id: "casts", label: "X casts achieved" },
  { id: "shardsPerSecond", label: "X shards/sec achieved" },
  { id: "points", label: "X points achieved" },
  { id: "timeElapsed", label: "X seconds elapsed" }
];

export function renderAutomationSettingsTab(state, setState) {
  const fragment = document.createDocumentFragment();

  fragment.append(renderAutomationSettingsPanel(state, setState));
  fragment.append(renderAutomaticRecastSettingsPanel(state, setState));

  return fragment;
}

function renderAutomationSettingsPanel(state, setState) {
  const panel = createElement("section", { className: "panel" });
  const automationConfig = getAutomationConfig(state);

  panel.append(createElement("h2", { className: "panel-title", text: "Automation" }));

  if (!automationConfig.unlocked) {
    panel.append(
      createElement("div", {
        className: "muted",
        text: "Automation is locked. Buy Automation Core in the Automation tab to enable these settings."
      })
    );
    return panel;
  }

  panel.append(
    createElement("div", {
      className: "muted",
      text: `Requested interval is clamped by your current automation minimum of ${automationConfig.minIntervalMs} ms.`
    })
  );

  const controls = createElement("div", { className: "roll-actions" });

  const enabledButton = createElement("button", {
    text: state.automation.enabled ? "Auto Roll: ON" : "Auto Roll: OFF",
    onClick: () => {
      setState((draft) => {
        draft.automation.enabled = !draft.automation.enabled;
      }, { topbar: false, content: true, sidebar: false });
    }
  });

  const displayModeButton = createElement("button", {
    text: `Display: ${displayModeLabel(state.automation.displayMode)}`,
    onClick: () => {
      setState((draft) => {
        draft.automation.displayMode = nextDisplayMode(draft.automation.displayMode);
      }, { topbar: false, content: true, sidebar: false });
    }
  });

  const intervalInput = document.createElement("input");
  intervalInput.type = "number";
  intervalInput.min = "250";
  intervalInput.step = "50";
  intervalInput.value = String(state.automation.intervalMs);
  styleInput(intervalInput);

  const confirmIntervalButton = createElement("button", {
    text: "Confirm Interval Change",
    onClick: () => {
      setState((draft) => {
        let value = Number(intervalInput.value);

        if (!Number.isFinite(value)) value = 0;
        if (value < 250) value = 250;

        draft.automation.intervalMs = value;
        intervalInput.value = String(value);
      }, { topbar: false, content: true, sidebar: false });
    }
  });

  controls.append(enabledButton, displayModeButton, intervalInput, confirmIntervalButton);
  panel.append(createElement("div", { className: "section-spacer" }));
  panel.append(controls);

  const status = createElement("div", {
    className: "muted",
    text:
      `Effective interval: ${automationConfig.effectiveIntervalMs} ms | ` +
      `Digit cap: ${automationConfig.digitCap} | ` +
      `Global factor: ${automationConfig.globalMultiplierFactor.toFixed(2)} | ` +
      `Pattern factor: ${automationConfig.patternMultiplierFactor.toFixed(2)} | ` +
      `Pattern currency factor: ${automationConfig.patternCurrencyFactor.toFixed(2)}`
  });
  status.style.marginTop = "12px";
  panel.append(status);

  return panel;
}

function renderAutomaticRecastSettingsPanel(state, setState) {
  const panel = createElement("section", { className: "panel" });
  const recastSettings = state.automation.recastSettings;
  const automaticRecastsUnlocked = hasUpgrade(state, "PRES00202", "castingUpgrades");
  const activeCondition = AUTO_RECAST_CONDITIONS.find((c) => c.id === recastSettings.condition)
    ?? AUTO_RECAST_CONDITIONS[0];

  panel.append(createElement("h2", { className: "panel-title", text: "Recast Settings" }));
  panel.append(
    createElement("div", {
      className: "muted",
      text: automaticRecastsUnlocked
        ? "Automatic recasts are enabled by the settings below."
        : "Buy the Automatic Recasts casting upgrade to enable these controls."
    })
  );

  const controls = createElement("div", { className: "roll-actions" });

  const activeToggleButton = createElement("button", {
    text: recastSettings.enabled ? "Automatic Recasts: ON" : "Automatic Recasts: OFF",
    onClick: () => {
      setState((draft) => {
        draft.automation.recastSettings.enabled = !draft.automation.recastSettings.enabled;
      }, { topbar: false, content: true, sidebar: false });
    }
  });
  activeToggleButton.disabled = !automaticRecastsUnlocked;

  const conditionToggleButton = createElement("button", {
    text: `Condition: ${activeCondition.label}`,
    onClick: () => {
      setState((draft) => {
        const currentIndex = AUTO_RECAST_CONDITIONS.findIndex(
          (condition) => condition.id === draft.automation.recastSettings.condition
        );

        const nextIndex = currentIndex >= 0
          ? (currentIndex + 1) % AUTO_RECAST_CONDITIONS.length
          : 0;

        draft.automation.recastSettings.condition = AUTO_RECAST_CONDITIONS[nextIndex].id;
      }, { topbar: false, content: true, sidebar: false });
    }
  });
  conditionToggleButton.disabled = !automaticRecastsUnlocked;

  const targetInput = document.createElement("input");
  targetInput.type = "text";
  targetInput.placeholder = "Enter target value";
  targetInput.value = recastSettings.targetValue ?? "";
  styleInput(targetInput);
  targetInput.disabled = !automaticRecastsUnlocked;

  const confirmTargetButton = createElement("button", {
    text: "Set Target",
    onClick: () => {
      setState((draft) => {
        draft.automation.recastSettings.targetValue = String(targetInput.value ?? "").trim();
      }, { topbar: false, content: true, sidebar: false });
    }
  });
  confirmTargetButton.disabled = !automaticRecastsUnlocked;

  controls.append(activeToggleButton, conditionToggleButton, targetInput, confirmTargetButton);
  panel.append(createElement("div", { className: "section-spacer" }));
  panel.append(controls);

  return panel;
}

function styleInput(input) {
  input.style.font = "inherit";
  input.style.padding = "10px 12px";
  input.style.borderRadius = "8px";
  input.style.border = "1px solid var(--border)";
  input.style.background = "var(--panel-2)";
  input.style.color = "var(--text)";
  input.style.minWidth = "220px";
}

function displayModeLabel(mode) {
  switch (mode) {
    case "show_all":
      return "Show All";
    case "show_none":
      return "Show None";
    default:
      return "Show Big Only";
  }
}

function nextDisplayMode(mode) {
  if (mode === "show_all") return "big_only";
  if (mode === "big_only") return "show_none";
  return "show_all";
}
