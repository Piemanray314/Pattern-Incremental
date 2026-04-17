import { getUpgradeLevel } from "../core/upgradeHelpers.js";

export const PATTERNS = [
  {
    id: "PAT000001",
    name: "Digit Count",
    description: "Matches every roll. Multiplier equals the digit count.",
    baseMultiplier: (rollString) => rollString.length,
    visibleWhen: () => true,
    unlockedWhen: () => true,
    evaluate(rollString) {
      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: rollString.length
      };
    }
  },

  {
    id: "PAT020101",
    name: "Even",
    description: "Roll is even.",
    baseMultiplier: () => 1.5,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString) {
      const lastIndex = rollString.length - 1;
      const lastDigit = Number(rollString[lastIndex]);

      if (lastDigit % 2 !== 0) return null;

      return {
        highlightedIndices: [lastIndex],
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT020102",
    name: "Divisible by 5",
    description: "Roll is divisible by 5",
    baseMultiplier: () => 2,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString) {
      const lastIndex = rollString.length - 1;
      const lastDigit = Number(rollString[lastIndex]);

      if (lastDigit % 5 !== 0) return null;

      return {
        highlightedIndices: [lastIndex],
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT020103",
    name: "Repeated Digits",
    description: "Any digit appears at least twice.",
    baseMultiplier: () => 2.5,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString) {
      const counts = {};
      for (let i = 0; i < rollString.length; i++) {
        const digit = rollString[i];
        counts[digit] = (counts[digit] ?? 0) + 1;
      }

      const repeatedDigits = new Set(
        Object.keys(counts).filter((digit) => counts[digit] >= 2)
      );

      if (repeatedDigits.size === 0) return null;

      const highlightedIndices = [];
      for (let i = 0; i < rollString.length; i++) {
        if (repeatedDigits.has(rollString[i])) {
          highlightedIndices.push(i);
        }
      }

      return {
        highlightedIndices,
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT020104",
    name: "All Identical Digits",
    description: "All digits are idential (and non-zero)",
    baseMultiplier: () => 10,
    patternCurrencyReward: () => 5,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString) {
      const first = rollString[0];
      const allSame = [...rollString].every((digit) => digit === first);

      if (!allSame) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030201",
    name: "Palindrome",
    description: "Roll is a palindrome",
    baseMultiplier: () => 5,
    patternCurrencyReward: () => 10,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString) {
      for (let i = 0; i < rollString.length / 2; i++) {
        if (rollString[i] !== rollString[rollString.length - i - 1])
          return null
      }

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030202",
    name: "Lucky 7s",
    description: "Roll contains 777",
    baseMultiplier: () => 7,
    patternCurrencyReward: () => 77,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("777")) {
        return null;
      }

      const level = getUpgradeLevel(state, "MULT030102");
      const baseMultiplier = this.baseMultiplier();
      const currentMultiplier = baseMultiplier + 7 * level;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier,
        currentMultiplier
      };
    }
  },

  {
    id: "PAT030203",
    name: "Increasing",
    description: "Digits increase from left to right",
    baseMultiplier: () => 3,
    patternCurrencyReward: () => 10,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString) {
      for (let i = 1; i < rollString.length; i++) {
        if (Number(rollString[i]) <= Number(rollString[i - 1]))
          return null;
      }

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030204",
    name: "Decreasing",
    description: "Digits decrease from left to right",
    baseMultiplier: () => 3,
    patternCurrencyReward: () => 10,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString) {
      for (let i = 1; i < rollString.length; i++) {
        if (Number(rollString[i]) >= Number(rollString[i - 1]))
          return null;
      }

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  }
];