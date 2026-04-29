import { hasUpgrade } from "../core/helpers/upgradeHelpers.js";
import { compareBigNum, fromNumber } from "../utils/bigNum.js";

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
    id: "linear",
    label: "Linear Tier",
    visibleWhen: (state) => hasUpgrade(state, "UNL049999")
  },
  {
    id: "challenges",
    label: "Challenges",
    visibleWhen: (state) => hasUpgrade(state, "PRES00203", "castingUpgrades")
  }
];