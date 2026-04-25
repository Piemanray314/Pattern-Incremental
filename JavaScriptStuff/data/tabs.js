import { hasUpgrade } from "../core/helpers/upgradeHelpers.js";

export const TABS = [
  {
    id: "roll",
    label: "Roll",
    visibleWhen: () => true
  },
  {
    id: "upgrades",
    label: "Upgrades",
    visibleWhen: () => true
  },
  {
    id: "casting",
    label: "Casting",
    visibleWhen: (state) => state.progression.castingUnlocked
  },
  {
    id: "automation",
    label: "Automation",
    visibleWhen: (state) => hasUpgrade(state, "DIG03")
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
    id: "settings",
    label: "Settings",
    visibleWhen: () => true
  }
];