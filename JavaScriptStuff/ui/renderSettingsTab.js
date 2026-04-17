import { createElement } from "../utils/dom.js";
import { deleteSave } from "../state/save.js";
import { createInitialState } from "../state/initialState.js";

export function renderSettingsTab(state, setState) {
  const panel = createElement("section", { className: "panel" });

  panel.append(
    createElement("h2", { className: "panel-title", text: "Settings" })
  );

  panel.append(
    createElement("div", {
      className: "muted",
      text: "Use hard reset to erase your local save and start over."
    })
  );

  const spacer = createElement("div", { className: "section-spacer" });
  panel.append(spacer);

  const hardResetButton = createElement("button", {
    text: "Hard Reset",
    onClick: () => {
      const confirmed = window.confirm(
        "Are you sure you want to permanently delete your save?"
      );

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