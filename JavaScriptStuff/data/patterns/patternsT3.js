import { getUpgradeLevel } from "../../core/helpers/upgradeHelpers.js";
import { averageAdjacentDifference, getConsecutiveEqualIndices, getDigitCounts, getDigits, getIndicesWithCount, getMultiplierDataPower, hasOutlierDigit, highlightAll, isNthPower, sumDigits} from "../../core/helpers/patternHelpers.js";

export const PATTERNS_T3 = [
  {
    id: "PAT050300",
    name: "Five of a Kind",
    description: "Roll contains five of the same digits",
    requiredDigits: 5,
    baseMultiplier: () => 100,
    patternCurrencyReward: () => 100,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      const highlightedIndices = getIndicesWithCount(rollString, 5);
      if (highlightedIndices.length === 0) return null;

      return {
        highlightedIndices,
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT050301",
    name: "Four of a Kind",
    description: "Roll contains four of the same digits",
    requiredDigits: 5,
    baseMultiplier: () => 40,
    patternCurrencyReward: () => 40,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      const highlightedIndices = getIndicesWithCount(rollString, 4);
      if (highlightedIndices.length === 0) return null;

      return {
        highlightedIndices,
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT050302",
    name: "Three of a Kind",
    description: "Roll contains three of the same digits",
    requiredDigits: 5,
    baseMultiplier: () => 15,
    patternCurrencyReward: () => 15,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      const highlightedIndices = getIndicesWithCount(rollString, 3);
      if (highlightedIndices.length === 0) return null;

      return {
        highlightedIndices,
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT050303",
    name: "Two Pair",
    description: "Roll contains two pairs of identical digits",
    requiredDigits: 5,
    baseMultiplier: () => 8,
    patternCurrencyReward: () => 8,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      const highlightedIndices = getIndicesWithCount(rollString, 2);

      if (highlightedIndices.length !== 4) return null;

      return {
        highlightedIndices,
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT050304",
    name: "One Pair",
    description: "Roll contains two identical digits",
    requiredDigits: 5,
    baseMultiplier: () => 4,
    patternCurrencyReward: () => 4,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      const highlightedIndices = getIndicesWithCount(rollString, 2);

      if (highlightedIndices.length !== 2) return null;

      return {
        highlightedIndices,
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT050401",
    name: "Full House",
    description: "Roll contains three identical digits and 2 other identical digits",
    requiredDigits: 5,
    baseMultiplier: () => 25,
    patternCurrencyReward: () => 25,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      const counts = Object.values(getDigitCounts(rollString)).sort((a, b) => b - a);

      if (counts.join(",") !== "3,2") return null;

      return {
        highlightedIndices: highlightAll(rollString),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT050402",
    name: "Straight",
    description: "Roll contains five digits that can be rearranged to form a consecutive sequence",
    requiredDigits: 5,
    baseMultiplier: () => 20,
    patternCurrencyReward: () => 20,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      const digits = [...new Set(getDigits(rollString))].sort((a, b) => a - b);

      if (digits.length !== rollString.length) return null;

      for (let i = 1; i < digits.length; i++) {
        if (digits[i] !== digits[i - 1] + 1) return null;
      }

      return {
        highlightedIndices: highlightAll(rollString),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT050403",
    name: "High Card",
    description: "Roll digits are all unique, multiplier based on highest",
    requiredDigits: 5,
    baseMultiplier: () => 1,
    patternCurrencyReward: () => 1,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (new Set(rollString).size !== rollString.length) return null;

      const digits = getDigits(rollString);
      let maxDigit = Math.max(...digits);

      if (maxDigit === 0) maxDigit = 1;

      const highlightedIndices = digits
        .map((digit, index) => digit === maxDigit ? index : null)
        .filter((index) => index !== null);

      return {
        highlightedIndices,
        baseMultiplier: maxDigit,
        currentPatternCurrencyReward: maxDigit
      };
    }
  },

  {
    id: "PAT050502",
    name: "Low Card",
    description: "Roll digits are all unique, multiplier based on lowest",
    requiredDigits: 3,
    baseMultiplier: () => 1,
    patternCurrencyReward: () => 1,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (new Set(rollString).size !== rollString.length) return null;

      const digits = getDigits(rollString);
      let minDigit = Math.min(...digits);

      if (minDigit === 0) minDigit = 1;

      const highlightedIndices = digits
        .map((digit, index) => digit === minDigit ? index : null)
        .filter((index) => index !== null);

      return {
        highlightedIndices,
        baseMultiplier: minDigit,
        currentPatternCurrencyReward: minDigit
      };
    }
  },

  {
    id: "PAT050102",
    name: "Connect 4",
    description: "Roll contains four consecutive idential digits",
    requiredDigits: 5,
    baseMultiplier: () => 50,
    patternCurrencyReward: () => 50,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      const highlightedIndices = getConsecutiveEqualIndices(rollString, 4);
      if (highlightedIndices.length === 0) return null;

      return {
        highlightedIndices,
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT050003",
    name: "Leading The Charge",
    description: "First digit is unique from the other digits that must be identical",
    requiredDigits: 5,
    baseMultiplier: () => 75,
    patternCurrencyReward: () => 75,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 6, rollString.length, 5);
    },
    evaluate(rollString, state) {
      const x = rollString[0];
      const y = rollString[1];

      if (x === y) return null;

      for (let i = 1; i < rollString.length; i++) {
        if (rollString[i] !== y) return null;
      }

      return {
        highlightedIndices: [0],
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT050103",
    name: "Center of Attention",
    description: "Only applicable for 5-digit. Center number is unique from the other 4 that are identical",
    requiredDigits: 5,
    baseMultiplier: () => 125,
    patternCurrencyReward: () => 125,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 8, rollString.length, 5);
    },
    evaluate(rollString, state) {
      if (rollString.length !== 5) return null;

      if (rollString[0] !== rollString[1]) return null;
      if (rollString[3] !== rollString[4]) return null;
      if (rollString[0] !== rollString[3]) return null;
      if (rollString[2] === rollString[0]) return null;

      return {
        highlightedIndices: [2],
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT050203",
    name: "Caboose",
    description: "Last digit is unique from the other digits that must be identical",
    requiredDigits: 5,
    baseMultiplier: () => 75,
    patternCurrencyReward: () => 75,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 8, rollString.length, 5);
    },
    evaluate(rollString, state) {
      const x = rollString[0];
      const y = rollString[4];

      if (y === x) return null;

      for (let i = 0; i < 4; i++) {
        if (rollString[i] !== x) return null;
      }

      return {
        highlightedIndices: [4],
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT050004",
    name: "High-diff",
    description: "Pairs of adjacent digits must have differences averaging at least 6",
    requiredDigits: 5,
    baseMultiplier: () => 200,
    patternCurrencyReward: () => 200,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 12, rollString.length, 5);
    },
    evaluate(rollString, state) {
      if (averageAdjacentDifference(rollString) < 6) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT050104",
    name: "Mid-off",
    description: "Pairs of adjacent digits must have differences averaging between 4 and 6 inclusive",
    requiredDigits: 5,
    baseMultiplier: () => 12,
    patternCurrencyReward: () => 12,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      const avg = sumDigits(rollString) / rollString.length;

      if (avg < 4 || avg > 6) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT050204",
    name: "Low-off",
    description: "Pairs of adjacent digits must have differences averaging at or below 2",
    requiredDigits: 5,
    baseMultiplier: () => 18,
    patternCurrencyReward: () => 18,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 2, rollString.length, 5);
    },
    evaluate(rollString, state) {
      if (averageAdjacentDifference(rollString) > 2) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT050005",
    name: "Power of 2",
    description: "Roll is a power of 2",
    requiredDigits: 5,
    baseMultiplier: () => 400,
    patternCurrencyReward: () => 400,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 10, rollString.length, 5);
    },
    evaluate(rollString, state) {
      if (isNthPower(rollString, 2)) {
        return {
          highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
        };
      }

      return null;
    }
  },

  {
    id: "PAT050105",
    name: "Power of 3",
    description: "Roll is a power of 3",
    requiredDigits: 5,
    baseMultiplier: () => 700,
    patternCurrencyReward: () => 700,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 10, rollString.length, 5);
    },
    evaluate(rollString, state) {
      if (isNthPower(rollString, 3)) {
        return {
          highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
        };
      }

      return null;
    }
  },

  {
    id: "PAT050205",
    name: "Power of 4",
    description: "Roll is a power of 4",
    requiredDigits: 5,
    baseMultiplier: () => 700,
    patternCurrencyReward: () => 700,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 10, rollString.length, 5);
    },
    evaluate(rollString, state) {
      if (isNthPower(rollString, 4)) {
        return {
          highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
        };
      }

      return null;
    }
  },

  {
    id: "PAT050305",
    name: "Power of 5",
    description: "Roll is a power of 5",
    requiredDigits: 5,
    baseMultiplier: () => 700,
    patternCurrencyReward: () => 700,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 10, rollString.length, 5);
    },
    evaluate(rollString, state) {
      if (isNthPower(rollString, 5)) {
        return {
          highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
        };
      }

      return null;
    }
  },

  {
    id: "PAT050405",
    name: "Power of 6",
    description: "Roll is a power of 6",
    requiredDigits: 5,
    baseMultiplier: () => 1000,
    patternCurrencyReward: () => 1000,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 10, rollString.length, 5);
    },
    evaluate(rollString, state) {
      if (isNthPower(rollString, 6)) {
        return {
          highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
        };
      }

      return null;
    }
  },

  {
    id: "PAT050505",
    name: "Power of 7",
    description: "Roll is a power of 7",
    requiredDigits: 5,
    baseMultiplier: () => 1000,
    patternCurrencyReward: () => 1000,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 10, rollString.length, 5);
    },
    evaluate(rollString, state) {
      if (isNthPower(rollString, 7)) {
        return {
          highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
        };
      }

      return null;
    }
  },

  {
    id: "PAT050605",
    name: "Power of 8",
    description: "Roll is a power of 8",
    requiredDigits: 5,
    baseMultiplier: () => 1000,
    patternCurrencyReward: () => 1000,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 10, rollString.length, 5);
    },
    evaluate(rollString, state) {
      if (isNthPower(rollString, 8)) {
        return {
          highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
        };
      }

      return null;
    }
  },

  {
    id: "PAT050705",
    name: "Power of 9",
    description: "Roll is a power of 9",
    requiredDigits: 5,
    baseMultiplier: () => 1000,
    patternCurrencyReward: () => 1000,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 10, rollString.length, 5);
    },
    evaluate(rollString, state) {
      if (isNthPower(rollString, 9)) {
        return {
          highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
        };
      }

      return null;
    }
  },

  {
    id: "PAT050006",
    name: "Outlier",
    description: "One digit has a difference of at least 6 with all other digits",
    requiredDigits: 5,
    baseMultiplier: () => 20,
    patternCurrencyReward: () => 20,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 3, rollString.length, 5);
    },
    evaluate(rollString, state) {
      const index = hasOutlierDigit(rollString, 6);
      if (index === -1) return null;

      return {
        highlightedIndices: [index],
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT050007",
    name: "Outerlier",
    description: "One digit has a difference of at least 7 with all other digits",
    requiredDigits: 5,
    baseMultiplier: () => 50,
    patternCurrencyReward: () => 50,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 5, rollString.length, 5);
    },
    evaluate(rollString, state) {
      const index = hasOutlierDigit(rollString, 7);
      if (index === -1) return null;

      return {
        highlightedIndices: [index],
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT050008",
    name: "Outerlier",
    description: "One digit has a difference of at least 8 with all other digits",
    requiredDigits: 5,
    baseMultiplier: () => 100,
    patternCurrencyReward: () => 100,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 8, rollString.length, 5);
    },
    evaluate(rollString, state) {
      const index = hasOutlierDigit(rollString, 8);
      if (index === -1) return null;

      return {
        highlightedIndices: [index],
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT050106",
    name: "Alternating Digits",
    description: "Alternate two identical digits in a XYXYX pattern",
    requiredDigits: 5,
    baseMultiplier: () => 400,
    patternCurrencyReward: () => 400,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 5, rollString.length, 5);
    },
    evaluate(rollString, state) {
      const x = rollString[0];
      const y = rollString[1];
      if (x === y) return null;

      for (let i = 0; i < rollString.length; i++) {
        const expected = i % 2 === 0 ? x : y;
        if (rollString[i] !== expected) return null;
      }

      const highlightedIndices = Array.from(
        { length: Math.ceil(rollString.length / 2) },
        (_, k) => k * 2
      );

      return {
        highlightedIndices,
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT050107",
    name: "Unstable",
    description: "Alternates increasing/decreasing between digits",
    requiredDigits: 5,
    baseMultiplier: () => 5,
    patternCurrencyReward: () => 5,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 2, rollString.length, 5);
    },
    evaluate(rollString, state) {
      const digits = getDigits(rollString);
      let firstDirection = 0;

      for (let i = 1; i < digits.length; i++) {
        const diff = digits[i] - digits[i - 1];
        if (diff === 0) return null;

        const direction = diff > 0 ? 1 : -1;

        if (i === 1) {
          firstDirection = direction;
        } else if (direction === firstDirection) {
          return null;
        }

        firstDirection *= -1;
      }

      const highlightedIndices = Array.from(
        { length: Math.floor(rollString.length / 2) },
        (_, k) => k * 2 + 1
      );

      return {
        highlightedIndices,
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT050206",
    name: "Caged",
    description: "Endpoints are 1",
    requiredDigits: 5,
    baseMultiplier: () => 15,
    patternCurrencyReward: () => 15,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      const lastIndex = rollString.length - 1;

      if (rollString[0] !== "1") return null;
      if (rollString[lastIndex] !== "1") return null;

      return {
        highlightedIndices: [0, lastIndex],
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT050306",
    name: "Qualitatively Equal",
    description: "All digits have the same length when written out in English",
    requiredDigits: 5,
    baseMultiplier: () => 25,
    patternCurrencyReward: () => 25,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 3, rollString.length, 5);
    },
    evaluate(rollString, state) {
      const lastIndex = rollString.length - 1;

      if (rollString[0] !== "1") return null;
      if (rollString[lastIndex] !== "1") return null;

      return {
        highlightedIndices: [0, lastIndex],
        ...this.getMultiplierData(rollString, state)
      };
    }
  },
  {
    id: "PAT050406",
    name: "Pure Chaos",
    description: "Digits are unique and alternate between even and odd",
    requiredDigits: 5,
    baseMultiplier: () => 45,
    patternCurrencyReward: () => 45,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), Math.pow(rollString.length - 3, 3), rollString.length, 5);
    },
    evaluate(rollString, state) {
      const digits = getDigits(rollString);
      if (new Set(rollString).size !== rollString.length) return null;

      const hasEven = digits.some((digit) => digit % 2 === 0);
      const hasOdd = digits.some((digit) => digit % 2 === 1);

      if (!hasEven || !hasOdd) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
      };
    }
  },
];