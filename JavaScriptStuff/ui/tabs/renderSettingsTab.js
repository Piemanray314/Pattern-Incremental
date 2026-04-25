import { createElement } from "../../utils/dom.js";
import { deleteSave, saveGame } from "../../state/save.js";
import { createInitialState } from "../../state/initialState.js";
import { getAutomationConfig } from "../../core/helpers/automationHelpers.js";
import { serializeSave, deserializeSave } from "../../state/saveCodec.js";

// Render the screen again with effective interval after inputing number

export function renderSettingsTab(state, setState) {
  const fragment = document.createDocumentFragment();

  fragment.append(renderNumberSettingsPanel(state, setState));
  fragment.append(renderAutomationSettingsPanel(state, setState));
  fragment.append(renderResetPanel(setState));
  fragment.append(renderImportExportPanel(state, setState));

  return fragment;
}

function renderNumberSettingsPanel(state, setState) {
  const panel = createElement("section", { className: "panel" });
  panel.append(createElement("h2", { className: "panel-title", text: "Numbers" }));

  panel.append(
    createElement("div", {
      className: "muted",
      text: "Choose how large point values are displayed."
    })
  );

  const actions = createElement("div", { className: "roll-actions" });

  actions.append(
    makeModeButton("Standard", "standard", state.settings.numberFormatMode, setState, "numberFormatMode"),
    makeModeButton("Scientific", "scientific", state.settings.numberFormatMode, setState, "numberFormatMode"),
    makeModeButton("Letters", "letters", state.settings.numberFormatMode, setState, "numberFormatMode"),
    makeModeButton("Literally Complete Silliness", "complete", state.settings.numberFormatMode, setState, "numberFormatMode")
  );

  panel.append(createElement("div", { className: "section-spacer" }));
  panel.append(actions);

  return panel;
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

function renderResetPanel(setState) {
  const panel = createElement("section", { className: "panel" });
  panel.append(createElement("h2", { className: "panel-title", text: "Save Data" }));
  panel.append(
    createElement("div", {
      className: "muted",
      text: "Use hard reset to erase your local save and start over."
    })
  );

  panel.append(createElement("div", { className: "section-spacer" }));

  const hardResetButton = createElement("button", {
    text: "Hard Reset",
    onClick: () => {
      const confirmed = window.confirm("Are you sure you want to permanently delete your save?");
      if (!confirmed) return;

      deleteSave();

      setState((draft) => {
        const fresh = createInitialState();
        for (const key of Object.keys(draft)) {
          delete draft[key];
        }
        Object.assign(draft, fresh);
      }, { topbar: true, content: true, sidebar: true });
    }
  });

  panel.append(hardResetButton);
  return panel;
}

function makeModeButton(label, mode, currentMode, setState, settingKey) {
  const button = createElement("button", {
    text: label,
    onClick: () => {
      setState((draft) => {
        draft.settings[settingKey] = mode;
      }, { topbar: true, content: true, sidebar: false });
    }
  });

  if (mode === currentMode) {
    button.style.borderColor = "var(--accent)";
  }

  return button;
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

function renderImportExportPanel(state, setState) {
  const panel = createElement("section", { className: "panel" });
  panel.append(createElement("h2", { className: "panel-title", text: "Import / Export Save" }));

  panel.append(
    createElement("div", {
      className: "muted",
      text: "Export your save for backup, or import a previous save."
    })
  );

  panel.append(createElement("div", { className: "section-spacer" }));

  const controls = createElement("div", { className: "roll-actions" });

  const copyButton = createElement("button", {
    text: "Copy Export",
    onClick: async () => {
      try {
        const text = serializeSave(state);
        await navigator.clipboard.writeText(text);
        alert("Save copied to clipboard.");
      } catch (error) {
        alert("Failed to copy save.");
      }
    }
  });

  const importButton = createElement("button", {
    text: "Import Save",
    onClick: () => {
      try {
        const imported = deserializeSave(textarea.value);

        setState((draft) => {
          for (const key of Object.keys(draft)) {
            delete draft[key];
          }
          Object.assign(draft, imported);
        }, { topbar: true, content: true, sidebar: true });

        saveGame(imported);
        alert("Save imported successfully.");
      } catch (error) {
        alert(`Import failed: ${error.message}`);
      }
    }
  });

  controls.append(copyButton, importButton);
  panel.append(controls);
  panel.append(createElement("div", { className: "section-spacer" }));

  const textarea = document.createElement("textarea");
  textarea.rows = 10;
  textarea.placeholder = "Paste exported save here...";
  textarea.style.width = "100%";
  textarea.style.font = "inherit";
  textarea.style.padding = "10px 12px";
  textarea.style.borderRadius = "8px";
  textarea.style.border = "1px solid var(--border)";
  textarea.style.background = "var(--panel-2)";
  textarea.style.color = "var(--text)";

  panel.append(textarea);
  panel.append(createElement("div", { className: "section-spacer" }));

  const saveOptions = createElement("div", { className: "file-save" });

  const downloadSaveButton = createElement("button", {
    text: "Download Save File",
    onClick: () => downloadSaveFile(state)
  });

  const fileInput = createSaveFileInput(setState);

  const importSaveButton = createElement("button", {
    text: "Import Save File",
    onClick: () => fileInput.click()
  });

  saveOptions.append(downloadSaveButton, importSaveButton);
  panel.append(saveOptions, fileInput);

  return panel;
}

function downloadSaveFile(state) {
  const saveText = serializeSave(state);

  const blob = new Blob([saveText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "pattern-incremental-save.txt";
  link.click();

  URL.revokeObjectURL(url);
}

function createSaveFileInput(setState) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt,.json";
  input.style.display = "none";

  input.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedState = deserializeSave(text);

      setState((draft) => {
        Object.keys(draft).forEach((key) => delete draft[key]);
        Object.assign(draft, importedState);
      }, { topbar: true, content: true, sidebar: true });

      alert("Save file imported successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to import save file.");
    }

    input.value = "";
  });

  return input;
}