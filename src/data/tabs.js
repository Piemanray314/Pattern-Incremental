import { hasUpgrade } from "../core/helpers/upgradeHelpers.js";

export const TABS = [
  {
    id: "roll",
    label: "Roll",
    visibleWhen: () => true,
    isPrimaryGameplay: true
  },
  {
    id: "upgrades",
    label: "Upgrades",
    visibleWhen: () => true,
    isPrimaryGameplay: true
  },
  {
    id: "casting",
    label: "Casting",
    visibleWhen: (state) => state.progression.castingUnlocked,
    isPrimaryGameplay: true
  },
  {
    id: "automation",
    label: "Automation",
    visibleWhen: (state) => hasUpgrade(state, "DIG03"),
    isPrimaryGameplay: true
  },
  {
    id: "challenges",
    label: "Challenges",
    visibleWhen: (state) => hasUpgrade(state, "PRES00203", "castingUpgrades"),
    isPrimaryGameplay: true
  },
  {
    id: "pieFactory",
    label: "Pies",
    visibleWhen: (state) => hasUpgrade(state, "PRES00204", "castingUpgrades"),
    isPrimaryGameplay: true
  },
  {
    id: "patterns",
    label: "Patterns",
    visibleWhen: () => true
  },
  {
    id: "stats",
    label: "Statistics",
    visibleWhen: () => true
  },
  {
    id: "bestRolls",
    label: "Best Rolls",
    visibleWhen: () => true
  },
  {
    id: "guide",
    label: "Guide",
    visibleWhen: () => true
  },
  {
    id: "automationSettings",
    label: "Automation Settings",
    visibleWhen: (state) => hasUpgrade(state, "DIG03")
  },
  {
    id: "settings",
    label: "Settings",
    visibleWhen: () => true
  }
];
