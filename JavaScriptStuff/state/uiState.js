// Mostly made for convenience while implementing upgrades with Live Server lol
// Preserves the last active tab through page refreshes and what not

const ACTIVE_TAB_KEY = "pattern_incremental_active_tab";

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

export function saveTreeViewPosition(viewStateKey, position) {
  try {
    sessionStorage.setItem(
      treeViewKey(viewStateKey),
      JSON.stringify({
        scrollLeft: position?.scrollLeft ?? 0,
        scrollTop: position?.scrollTop ?? 0
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
      scrollTop: parsed?.scrollTop ?? 0
    };
  } catch {
    return null;
  }
}