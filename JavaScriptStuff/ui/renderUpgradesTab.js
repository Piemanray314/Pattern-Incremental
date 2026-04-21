import { renderTreeView } from "./renderTreeView.js";
import { UPGRADE_TREE_GROUPS } from "../data/upgradeTreeGroups.js";
import { saveSubtab } from "../state/uiState.js";
import { createElement } from "../utils/dom.js";

export function renderUpgradesTab(state, setState) {
  const container = document.createDocumentFragment();

  const visibleGroups = UPGRADE_TREE_GROUPS.filter((group) => group.visibleWhen(state));
  const activeId = visibleGroups.some((g) => g.id === state.ui.upgradesSubtab)
    ? state.ui.upgradesSubtab
    : visibleGroups[0]?.id;

  const activeGroup = visibleGroups.find((group) => group.id === activeId);

  const subtabBar = createElement("div", { className: "roll-actions" });

  for (const group of visibleGroups) {
    const button = createElement("button", {
      text: group.label,
        onClick: () => {
          setState((draft) => {
            draft.ui.upgradesSubtab = group.id;
          }, { topbar: false, content: true, sidebar: false });

          saveSubtab("upgradesSubtab", group.id);
        }
    });

    if (group.id === activeId) {
      button.style.borderColor = "var(--accent)";
    }

    subtabBar.append(button);
  }

  container.append(subtabBar);
  container.append(createElement("div", { className: "section-spacer" }));

  if (!activeGroup) {
    container.append(
      createElement("div", { className: "muted", text: "No upgrade trees available." })
    );
    return container;
  }

  container.append(
    renderTreeView({
      state,
      setState,
      title: activeGroup.label,
      definitions: activeGroup.definitions,
      stateKey: activeGroup.stateKey,
      viewStateKey: activeGroup.viewStateKey
    })
  );

  return container;
}