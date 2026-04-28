// Mostly made for convenience while implementing upgrades with Live Server lol
// Preserves the last active tab through page refreshes and what not

const ACTIVE_TAB_KEY = "pattern_incremental_active_tab";

// Saves the active tab (left bar)\
export function saveActiveTab(tabId) {
  try {
    sessionStorage.setItem(ACTIVE_TAB_KEY, tabId);
  } catch {
    
  }
}

export function loadActiveTab() {
  try {
    return sessionStorage.getItem(ACTIVE_TAB_KEY);
  } catch {
    return null;
  }
}

function treeViewKey(viewStateKey) {
  return `pattern_incremental_tree_view_${viewStateKey}`;
}

// Saves the x, y position of the "camera" while in upgrades
export function saveTreeViewPosition(viewStateKey, position) {
  try {
    sessionStorage.setItem(
      treeViewKey(viewStateKey),
      JSON.stringify({
        scrollLeft: position?.scrollLeft ?? 0,
        scrollTop: position?.scrollTop ?? 0,
        zoom: position?.zoom ?? 0
      })
    );
  } catch {

  }
}

export function loadTreeViewPosition(viewStateKey) {
  try {
    const raw = sessionStorage.getItem(treeViewKey(viewStateKey));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return {
      scrollLeft: parsed?.scrollLeft ?? 0,
      scrollTop: parsed?.scrollTop ?? 0,
      zoom: parsed?.zoom ?? 0
    };
  } catch {
    return null;
  }
}

// Saves subtabs in upgrades (and in the future, automation and prestige)
function subtabKey(subtabStateKey) {
  return `pattern_incremental_subtab_${subtabStateKey}`;
}

export function saveSubtab(subtabStateKey, subtabId) {
  try {
    sessionStorage.setItem(subtabKey(subtabStateKey), subtabId);
  } catch {
    
  }
}

export function loadSubtab(subtabStateKey) {
  try {
    return sessionStorage.getItem(subtabKey(subtabStateKey));
  } catch {
    return null;
  }
}

export function resetAllTreeViewPositions(state) {
  const resetView = { scrollLeft: 0, scrollTop: 0, zoom: 1 };

  for (const key of Object.keys(state.ui)) {
    if (!key.includes("TreeView")) continue;

    state.ui[key] = { ...resetView };
    saveTreeViewPosition(key, resetView);
  }
}