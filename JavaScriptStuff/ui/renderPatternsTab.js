import { PATTERNS } from "../data/patterns.js";
import { createElement } from "../utils/dom.js";
import { formatMultiplier, formatNumber } from "../utils/format.js";
import { evaluateRollString } from "../core/rollEngine.js";

export function renderPatternsTab(state, setState) {
  const fragment = document.createDocumentFragment();

  const previewPanel = createElement("section", { className: "panel" });
  previewPanel.append(
    createElement("h2", { className: "panel-title", text: "Pattern Preview" })
  );

  const previewDescription = createElement("div", {
    className: "muted",
    text: `Enter a ${state.progression.maxDigitsUnlocked}-digit number to preview its value using unlocked patterns.`
  });

  const previewControls = createElement("div", { className: "roll-actions" });

  const input = document.createElement("input");
  input.type = "text";
  input.value = state.ui.patternPreviewInput ?? "";
  input.placeholder = `${state.progression.maxDigitsUnlocked}-digit number`;
  input.style.font = "inherit";
  input.style.padding = "10px 12px";
  input.style.borderRadius = "8px";
  input.style.border = "1px solid var(--border)";
  input.style.background = "var(--panel-2)";
  input.style.color = "var(--text)";
  input.style.minWidth = "240px";

  const includeGlobalToggle = createElement("button", {
    text: state.ui.patternPreviewIncludeGlobal ? "Global: ON" : "Global: OFF",
    onClick: () => {
      setState((draft) => {
        draft.ui.patternPreviewIncludeGlobal = !draft.ui.patternPreviewIncludeGlobal;
      }, { topbar: false, content: true, sidebar: false });
    }
  });

  const clearButton = createElement("button", {
    text: "Clear",
    onClick: () => {
      setState((draft) => {
        draft.ui.patternPreviewInput = "";
      }, { topbar: false, content: true, sidebar: false });
    }
  });

  const previewResultHost = createElement("div");

  input.addEventListener("input", (event) => {
    const rawValue = event.target.value.replace(/\D/g, "");
    state.ui.patternPreviewInput = rawValue;
    renderPreviewResultInto(previewResultHost, state);
  });

  previewControls.append(input, includeGlobalToggle, clearButton);
  previewPanel.append(previewDescription, previewControls);
  previewPanel.append(createElement("div", { className: "section-spacer" }));
  previewPanel.append(previewResultHost);

  renderPreviewResultInto(previewResultHost, state);

  const listPanel = createElement("section", { className: "panel" });
  listPanel.append(
    createElement("h2", { className: "panel-title", text: "Patterns" })
  );

  const table = createElement("div", { className: "pattern-table" });

  for (const pattern of PATTERNS) {
    const isVisible = pattern.visibleWhen(state);
    const isUnlocked = pattern.unlockedWhen(state);

    const name = isUnlocked ? pattern.name : "???";
    const description = isUnlocked ? pattern.description : "???";

    let baseMultiplierText = "???";
    let currentMultiplierText = "???";

    if (isUnlocked) {
      const previewRoll = pattern.previewRollString ?? getDefaultPatternPreviewRoll(state, pattern);
      const previewMultipliers = getPatternPreviewMultipliers(state, pattern, previewRoll);

      baseMultiplierText = formatMultiplier(previewMultipliers.baseMultiplier);
      currentMultiplierText = formatMultiplier(previewMultipliers.currentMultiplier);
    }

    const row = createElement("div", { className: "pattern-row" });
    row.append(
      createElement("div", { text: name }),
      createElement("div", { text: description }),
      createElement("div", {
        text: `${baseMultiplierText} (${currentMultiplierText})`
      })
    );

    table.append(row);
  }

  listPanel.append(table);

  fragment.append(previewPanel, listPanel);
  return fragment;
}

function renderPreviewResultInto(host, state) {
  host.innerHTML = "";

  const previewResult = evaluatePatternPreview(
    state,
    state.ui.patternPreviewInput ?? "",
    state.ui.patternPreviewIncludeGlobal ?? false
  );

  if (!previewResult.isValid) {
    host.append(
      createElement("div", {
        className: "muted",
        text: previewResult.message
      })
    );
    return;
  }

  const summary = createElement("div", { className: "roll-summary" });
  summary.append(
    summaryPill(`Roll: ${previewResult.raw}`),
    // summaryPill(`Base Value: ${formatNumber(previewResult.baseRollValue)}`),
    summaryPill(`Pre-Bonus: +${formatNumber(previewResult.preMultiplierFlatBonus)}`),
    summaryPill(`Modified Base: ${formatNumber(previewResult.modifiedBaseValue)}`),
    summaryPill(`Pattern Multiplier: ${formatMultiplier(previewResult.patternMultiplier)}`),
    summaryPill(`Global Multiplier: ${formatMultiplier(previewResult.globalMultiplier)}`),
    summaryPill(`Final Value: ${formatNumber(previewResult.totalGain)}`)
  );

  host.append(summary);
  host.append(createElement("div", { className: "section-spacer" }));

  const matchList = createElement("div", { className: "match-list" });

  if (previewResult.matches.length === 0) {
    matchList.append(
      createElement("div", { className: "muted", text: "No unlocked patterns matched." })
    );
  } else {
    for (const match of previewResult.matches) {
      matchList.append(renderPreviewMatchRow(previewResult.raw, match));
    }
  }

  host.append(matchList);
}

function evaluatePatternPreview(state, input, includeGlobal) {
  const raw = String(input ?? "").trim();

  if (raw.length === 0) {
    return {
      isValid: false,
      message: "Enter a number to preview."
    };
  }

  if (!/^\d+$/.test(raw)) {
    return {
      isValid: false,
      message: "Only digits are allowed."
    };
  }

  const expectedDigits = state.progression.maxDigitsUnlocked;

  if (raw.length !== expectedDigits) {
    return {
      isValid: false,
      message: `Preview number must be exactly ${expectedDigits} digits.`
    };
  }

  if (raw.length > 1 && raw[0] === "0") {
    return {
      isValid: false,
      message: "Preview number cannot start with 0."
    };
  }

  const previewResult = evaluateRollString(state, raw, {
    includeGlobal,
    includePostMultiplierFlatBonus: includeGlobal,
    includePatternCurrency: false
  });

  return {
    isValid: true,
    ...previewResult
  };
}

function getPatternPreviewMultipliers(state, pattern, previewRoll) {
  const result = pattern.evaluate(previewRoll, state);

  const baseMultiplier =
    result?.baseMultiplier ??
    (typeof pattern.baseMultiplier === "function"
      ? pattern.baseMultiplier(previewRoll, state)
      : 1);

  const currentMultiplier =
    result?.currentMultiplier ?? baseMultiplier;

  return {
    baseMultiplier,
    currentMultiplier
  };
}

function getDefaultPatternPreviewRoll(state, pattern) {
  const digits = state.progression.maxDigitsUnlocked;

  const explicit = pattern.previewRollString;
  if (explicit) return explicit;

  if (digits === 1) return "8";
  return "1".repeat(digits);
}

function renderPreviewMatchRow(rollString, match) {
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

  row.append(
    digitRow,
    createElement("div", { text: formatMultiplier(match.currentMultiplier) }),
    createElement("div", { text: match.patternName })
  );

  return row;
}

function summaryPill(text) {
  return createElement("div", { className: "summary-pill", text });
}