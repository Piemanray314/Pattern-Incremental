// Formats upgradeIds like "TYPEXXYYZZ" from type, stage, row, and column
export function makeUpgradeId(type, stage, row, column) {
  return `${type}${pad2(stage)}${pad2(row)}${pad2(column)}`;
}

// Creates a full upgrade definition, defaulting id, x, y, and stage from the given type and grid position
export function makeUpgradeDefinition(type, stage, row, column, extra = {}) {
  return {
    id: makeUpgradeId(type, stage, row, column),
    x: column,
    y: row,
    stage,
    ...extra
  };
}

// Prestige is format PRES 0 XX YY
export function makePrestigeUpgradeDefinition(type, stage, row, column, extra = {}) {
  return {
    id: `${type}${stage}${pad2(row)}${pad2(column)}`,
    x: column,
    y: row,
    stage,
    ...extra
  };
}

// Creates pattern descriptions based on title
export function makeUpgradePatternDefinition(type, stage, row, column, title, extra = {}) {
  return {
    id: makeUpgradeId(type, stage, row, column),
    x: column,
    y: row,
    stage,
    title,
    description: `Unlocks the ${title} pattern`,
    ...extra
  };
}

// Adds a "0" in front of 1-digit values
function pad2(value) {
  return String(value).padStart(2, "0");
}