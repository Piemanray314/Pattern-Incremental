import { createElement } from "../utils/dom.js";
import { changeLog } from "../data/changeLog.js";

export function renderChangeLogModal(state, setState) {
  if (!state.ui.showChangeLogModal) return null;

  const overlay = createElement("div", { className: "modal-overlay" });
  const modal = createElement("div", { className: "modal-panel" });

  const header = createElement("div", { className: "panel-header-row" });
  header.append(
    createElement("h2", { className: "panel-title", text: "Change Log" }),
    createElement("button", {
      text: "Close",
      onClick: () => {
        setState((draft) => {
          draft.ui.showChangeLogModal = false;
        }, { topbar: false, content: true, sidebar: false });
      }
    })
  );

  modal.append(header);

  for (const entry of changeLog) {
    const section = createElement("section", { className: "panel" });

    section.append(
      createElement("h3", {
        text: `${entry.version}: ${entry.title}`
      })
    );

    const list = createElement("ul");
    for (const item of entry.entries) {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    }

    section.append(list);
    modal.append(section);
  }

  overlay.append(modal);

  overlay.addEventListener("click", (event) => {
    if (event.target !== overlay) return;

    setState((draft) => {
      draft.ui.showChangeLogModal = false;
    }, { topbar: false, content: true, sidebar: false });
  });

  return overlay;
}