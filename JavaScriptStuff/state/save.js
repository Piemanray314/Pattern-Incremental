import { serializeSave, deserializeSave } from "./saveCodec.js";

const SAVE_KEY = "pattern_incremental_save";

// Saves game to localStorage OBVIOUSLY DUHHHHH
export function saveGame(state) {
  try {
    // localStorage persists through browser close / OS reboot
    localStorage.setItem(SAVE_KEY, serializeSave(state));
  } catch (error) {
    console.error("Failed to save game:", error);
  }
}

// Loads game from... you guessed it! localStorage!!!!
export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;

  try {
    localStorage.setItem(`${SAVE_KEY}_backup_before_load`, raw);
    return deserializeSave(raw);
  } catch (error) {
    console.error("Failed to load save:", error);
    alert("Save failed to load. Your old save was backed up and will not be overwritten.");
    return null;
  }
}

// Hmmm I wonder what this does.... Wait? Maybe it deletes the storage entry? 
export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}