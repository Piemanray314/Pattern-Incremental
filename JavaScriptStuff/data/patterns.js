import { getUpgradeLevel } from "../core/upgradeHelpers.js";
import { isNthPower, sumDigits } from "../core/patternHelpers.js";

// ID format: PAT###### = type + stage + row + column, each using 2 digits

// An example with all fields:
/*
  {
    id: "PAT000001",
    name: "Digit Count",
    description: "Matches every roll. Multiplier equals the digit count.",
    previewRollString: "777",
    baseMultiplier: (rollString) => 5,
    patternCurrencyReward: () => 10,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    
    getMultiplierData(state) {
      const baseMultiplier = this.baseMultiplier();
      const level = getUpgradeLevel(state, "MULT030302");
      const currentMultiplier = baseMultiplier + baseMultiplier * level;

      return {
        baseMultiplier,
        currentMultiplier
      };
    },

    evaluate(rollString, state) {
      if (!rollString.includes("777")) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        ...this.getMultiplierData(state)
      };
    }
  }
*/
// baseMultiplier and patternCurrencyReward can be expressions and default to 1
// All pattern IDs should be identical with their IDs in upgrades and can be checked in unlockWhen(state) with this.id
// currentMultiplier takes precedence over baseMultiplier and represents the base after upgrades
// For patterns like Lucky 7s witha currentMultiplier, use getMultiplierData to set up intermediary multiplier calculations

// List of all patterns
export const PATTERNS = [
  {
    id: "PAT000001",
    name: "Digit Count",
    description: "Matches every roll. Multiplier equals the digit count.",
    baseMultiplier: (rollString) => rollString.length,
    patternCurrencyReward: () => 1,
    visibleWhen: () => true,
    unlockedWhen: () => true,
    getMultiplierData(state) {
      const baseMultiplier = state.progression.maxDigitsUnlocked;

      return {
        baseMultiplier,
        currentMultiplier: baseMultiplier
      };
    },

    evaluate(rollString) {
      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        ...this.getMultiplierDataFromLength(rollString.length)
      };
    }
  },

  {
    id: "PAT020101",
    name: "Even",
    description: "Roll is even.",
    baseMultiplier: () => 1.5,
    patternCurrencyReward: () => 1,
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
    patternCurrencyReward: () => 2,
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
    patternCurrencyReward: () => 1,
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
      if (rollString.length <= 1) return null;

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
      if (rollString.length <= 1) return null;

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

    getMultiplierData(state) {
      const baseMultiplier = this.baseMultiplier();
      const level = getUpgradeLevel(state, "MULT030302");
      const currentMultiplier = baseMultiplier + baseMultiplier * level;

      return {
        baseMultiplier,
        currentMultiplier
      };
    },

    evaluate(rollString, state) {
      if (!rollString.includes("777")) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        ...this.getMultiplierData(state)
      };
    }
  },

  {
    id: "PAT030203",
    name: "Ascending",
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
    name: "Descending",
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
  },

  {
    id: "PAT030105",
    name: "Square",
    description: "Roll is a square number",
    baseMultiplier: () => 4,
    patternCurrencyReward: () => 4,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString) {
      if(!isNthPower(rollString, 2)) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030106",
    name: "Cubic",
    description: "Roll is a cubic number",
    baseMultiplier: () => 6,
    patternCurrencyReward: () => 6,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString) {
      if(!isNthPower(rollString, 3)) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030107",
    name: "Quartic",
    description: "Roll is a quartic number",
    baseMultiplier: () => 8,
    patternCurrencyReward: () => 8,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString) {
      if(!isNthPower(rollString, 4)) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030108",
    name: "Quintic",
    description: "Roll is a quintic number",
    baseMultiplier: () => 10,
    patternCurrencyReward: () => 10,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString) {
      if(!isNthPower(rollString, 5)) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030109",
    name: "Sextic",
    description: "Roll is a sextic number",
    baseMultiplier: () => 12,
    patternCurrencyReward: () => 12,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString) {
      if(!isNthPower(rollString, 6)) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030110",
    name: "Septic",
    description: "Roll is a septic number",
    baseMultiplier: () => 14,
    patternCurrencyReward: () => 14,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString) {
      if(!isNthPower(rollString, 7)) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030111",
    name: "Octic",
    description: "Roll is a octic number",
    baseMultiplier: () => 16,
    patternCurrencyReward: () => 16,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString) {
      if(!isNthPower(rollString, 8)) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030112",
    name: "Nonic",
    description: "Roll is a nonic number",
    baseMultiplier: () => 18,
    patternCurrencyReward: () => 18,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString) {
      if(!isNthPower(rollString, 9)) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030113",
    name: "Decic",
    description: "Roll is a decic number",
    baseMultiplier: () => 20,
    patternCurrencyReward: () => 20,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString) {
      if(!isNthPower(rollString, 10)) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030205",
    name: "Lowball",
    description: "Sum of digits is less than or equal unlocked digits + 5",
    baseMultiplier: () => 2,
    patternCurrencyReward: () => 3,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if(sumDigits(rollString) > state.progression.maxDigitsUnlocked + 5) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030206",
    name: "Lowerball",
    description: "Sum of digits is less than or equal unlocked digits + 3",
    baseMultiplier: () => 4,
    patternCurrencyReward: () => 5,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if(sumDigits(rollString) > state.progression.maxDigitsUnlocked + 3) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030207",
    name: "Lowestball",
    description: "Sum of digits is less than or equal unlocked digits + 1",
    baseMultiplier: () => 10,
    patternCurrencyReward: () => 10,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if(sumDigits(rollString) > state.progression.maxDigitsUnlocked + 1) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030305",
    name: "Highball",
    description: "Sum of digits is greater than or equal 9 times unlocked digits - 5",
    baseMultiplier: () => 2,
    patternCurrencyReward: () => 3,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if(sumDigits(rollString) < 9 * state.progression.maxDigitsUnlocked - 5) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030306",
    name: "Higherball",
    description: "Sum of digits is greater than or equal 9 times unlocked digits - 3",
    baseMultiplier: () => 4,
    patternCurrencyReward: () => 5,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if(sumDigits(rollString) < 9 * state.progression.maxDigitsUnlocked - 3) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT030307",
    name: "Highestball",
    description: "Sum of digits is greater than or equal 9 times unlocked digits - 1",
    baseMultiplier: () => 10,
    patternCurrencyReward: () => 10,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if(sumDigits(rollString) < 9 * state.progression.maxDigitsUnlocked - 5) return null;

      return {
        highlightedIndices: [...rollString].map((_, index) => index),
        baseMultiplier: this.baseMultiplier()
      };
    }
  }
];