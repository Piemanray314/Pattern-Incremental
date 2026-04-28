import { createElement } from "../../utils/dom.js";
import { saveSubtab } from "../../state/uiState.js";
import { GUIDE_SECTIONS } from "../../data/guideSections.js";
import { getGuideContent } from "../../data/guideContent.js";

export function renderGuideTab(state, setState) {
  const fragment = document.createDocumentFragment();

  const allSections = GUIDE_SECTIONS;
  const isUnlocked = (section) => section.visibleWhen(state);

  const activeId = allSections.some((section) => section.id === state.ui.guideSubtab)
    ? state.ui.guideSubtab
    : allSections[0]?.id;

  const activeSection = allSections.find((section) => section.id === activeId);
  const unlocked = isUnlocked(activeSection);

  const content = unlocked
    ? getGuideContent(activeId, state)
    : {
        title: "???",
        paragraphs: ["You have not unlocked this yet."]
      };

  const layout = createElement("div");
  layout.style.display = "grid";
  layout.style.gridTemplateColumns = "220px 1fr";
  layout.style.gap = "16px";
  layout.style.alignItems = "start";

  // Left side: section list
  const sidebarPanel = createElement("section", { className: "panel" });
  sidebarPanel.append(
    createElement("h2", { className: "panel-title", text: "Guide" })
  );

  const sectionList = createElement("div", { className: "roll-actions" });
  sectionList.style.flexDirection = "column";
  sectionList.style.alignItems = "stretch";
  sectionList.style.gap = "8px";
  sectionList.style.display = "flex";

  for (const section of allSections) {
    const unlocked = isUnlocked(section);

    const button = createElement("button", {
      text: unlocked ? section.label : "???",
      onClick: () => {
        setState((draft) => {
          draft.ui.guideSubtab = section.id;
        }, { topbar: false, content: true, sidebar: false });

        saveSubtab("guideSubtab", section.id);
      }
    });

    if (!unlocked) {
      button.style.opacity = "0.5";
    }

    if (section.id === activeId) {
      button.style.borderColor = "var(--accent)";
    }

    sectionList.append(button);
  }

  sidebarPanel.append(sectionList);

  // Right side: content
  const contentPanel = createElement("section", { className: "panel" });
  contentPanel.append(
    createElement("h2", { className: "panel-title", text: content.title })
  );

  for (const paragraph of content.paragraphs) {
    const p = createElement("div", { text: paragraph });
    p.style.marginBottom = "12px";
    contentPanel.append(p);
  }

  layout.append(sidebarPanel, contentPanel);
  fragment.append(layout);

  return fragment;
}