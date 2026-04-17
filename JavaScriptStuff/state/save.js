const SAVE_KEY = "pattern_incremental_save";

export function saveGame(state) {
  state.meta.lastSavedAt = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load save:", error);
    return null;
  }
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}