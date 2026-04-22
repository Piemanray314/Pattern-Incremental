import { hasUpgrade } from "../core/upgradeHelpers.js";

export const GUIDE_SECTIONS = [
  {
    id: "introduction",
    label: "Introduction",
    visibleWhen: () => true
  },
  {
    id: "rolls",
    label: "Rolls",
    visibleWhen: () => true
  },
  {
    id: "points",
    label: "Points",
    visibleWhen: () => true
  },
  {
    id: "patterns",
    label: "Patterns",
    visibleWhen: () => true
  },
  {
    id: "upgrades",
    label: "Upgrades",
    visibleWhen: () => true
  },
  {
    id: "simulateRoll",
    label: "Simulating Rolls",
    visibleWhen: () => true
  },
  {
    id: "bestRolls",
    label: "Best Rolls",
    visibleWhen: () => true
  },
  {
    id: "automation",
    label: "Automation",
    visibleWhen: (state) => state.progression.castingUnlocked || hasUpgrade(state, "DIG03")
  },
  {
    id: "tiers",
    label: "Tiers",
    visibleWhen: (state) => state.progression.castingUnlocked || hasUpgrade(state, "UNL039999")
  },
  {
    id: "recasting",
    label: "Recasting",
    visibleWhen: (state) => state.progression.castingUnlocked
  },
  {
    id: "challenges",
    label: "Challenges",
    visibleWhen: (state) => state.progression.castingUnlocked
  }
];