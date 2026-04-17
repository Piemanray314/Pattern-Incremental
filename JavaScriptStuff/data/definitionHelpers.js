export function makeUpgradeId(type, stage, row, column) {
  return `${type}${pad2(stage)}${pad2(row)}${pad2(column)}`;
}

export function makeUpgradeDefinition(
  type,
  stage,
  row,
  column,
  extra = {}
) {
  return {
    id: makeUpgradeId(type, stage, row, column),
    x: column,
    y: row,
    stage,
    ...extra
  };
}

function pad2(value) {
  return String(value).padStart(2, "0");
}