import { hasUpgrade, grantUpgradeLevel } from "./upgradeHelpers.js";
import { AUTOMATION_UPGRADES } from "../../data/automationupgrades/automationUpgradesMain.js";

// Grants only the auto-routing upgrade that corresponds to a newly unlocked digit
// Used by Precision Recast (PRES00201)
export function grantPrecisionRecastRoutingUpgrade(state, digit) {
  if (!hasUpgrade(state, "PRES00201", "castingUpgrades")) return false;

  const autoRoutingByDigit = {
    2: "AUTO030201",
    3: "AUTO030301",
    4: "AUTO040401",
    5: "AUTO050501",
    6: "AUTO060601",
    7: "AUTO070701",
    8: "AUTO080801",
    9: "AUTO090901"
  };

  let grantedAny = false;

  for (let d = 2; d <= digit; d++) {
    const upgradeId = autoRoutingByDigit[d];
    if (!upgradeId) continue;

    const granted = grantUpgradeLevel(
      state,
      upgradeId,
      1,
      AUTOMATION_UPGRADES,
      "automationUpgrades",
      { runOnBuy: true }
    );

    grantedAny = grantedAny || granted;
  }

  return grantedAny;
}
