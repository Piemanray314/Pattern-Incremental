import { getUpgradeLevel } from "../../core/helpers/upgradeHelpers.js";
import { getMultiplierDataPower, isNthPower, sumDigits, highlightAll, getDigits, 
  getSubstringIndices, countDistinctDigits, getConsecutiveEqualIndices, allAdjacentDifferencesAtMost, 
  isStrictAscendingByOne, isStrictDescendingByOne, getMiniSandwichIndices, getSandwichIndices, allDigitsWithinSpan } from "../../core/helpers/patternHelpers.js";

export const PATTERNS_T2 = [
  {
    id: "PAT040002",
    name: "Luckier 7s",
    description: "Roll contains 7777",
    requiredDigits: 4,
    baseMultiplier: () => 77,
    patternCurrencyReward: () => 777,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("7777")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "7777"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040103",
    name: "Double Trouble",
    description: "Exactly two types of digits present",
    requiredDigits: 3,
    baseMultiplier: () => 3,
    patternCurrencyReward: () => 5,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 4, rollString.length, 4);
    },
    evaluate(rollString, state) {
      if (countDistinctDigits(rollString) !== 2) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT040003",
    name: "Triple Terror",
    description: "Exactly three types of digits present",
    requiredDigits: 4,
    baseMultiplier: () => 2,
    patternCurrencyReward: () => 3,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 3, rollString.length, 4);
    },
    evaluate(rollString, state) {
      if (countDistinctDigits(rollString) !== 3) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT040004",
    name: "Tic-Tac-Toe",
    description: "Three identical adjacent digits",
    requiredDigits: 3,
    baseMultiplier: () => 8,
    patternCurrencyReward: () => 15,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      const highlightedIndices = getConsecutiveEqualIndices(rollString, 3);
      if (highlightedIndices.length === 0) return null;

      return {
        highlightedIndices,
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040104",
    name: "Couples",
    description: "Two identical adjacent digits",
    requiredDigits: 3,
    baseMultiplier: () => 2,
    patternCurrencyReward: () => 2,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      const highlightedIndices = getConsecutiveEqualIndices(rollString, 2);
      if (highlightedIndices.length === 0) return null;

      return {
        highlightedIndices,
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040303",
    name: "Mini Sandwich",
    description: "Two equal digits with exactly one different digit between them",
    requiredDigits: 4,
    baseMultiplier: () => 2,
    patternCurrencyReward: () => 2,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      const highlightedIndices = getMiniSandwichIndices(rollString);
      if (highlightedIndices.length === 0) return null;

      return {
        highlightedIndices,
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040304",
    name: "Sandwich",
    description: "Two equal digits with exactly one different digit between them",
    requiredDigits: 3,
    baseMultiplier: () => 5,
    patternCurrencyReward: () => 5,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      const highlightedIndices = getSandwichIndices(rollString, 2);
      if (highlightedIndices.length === 0) return null;

      return {
        highlightedIndices,
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040204",
    name: "3D",
    description: "Divisible by 3",
    requiredDigits: 3,
    baseMultiplier: () => 3,
    patternCurrencyReward: () => 3,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (Number(rollString) % 3 !== 0) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040105",
    name: "Hands Full",
    description: "Divisible by 10",
    requiredDigits: 3,
    baseMultiplier: () => 5,
    patternCurrencyReward: () => 10,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (Number(rollString) % 10 !== 0) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040005",
    name: "Century",
    description: "Divisible by 100",
    requiredDigits: 3,
    baseMultiplier: () => 15,
    patternCurrencyReward: () => 100,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (Number(rollString) % 100 !== 0) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040006",
    name: "M",
    description: "Divisible by 1000",
    requiredDigits: 4,
    baseMultiplier: () => 75,
    patternCurrencyReward: () => 1000,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (Number(rollString) % 1000 !== 0) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040106",
    name: "Loopy",
    description: "Only contains digits 0, 4, 6, 8, 9",
    requiredDigits: 2,
    baseMultiplier: () => 2,
    patternCurrencyReward: () => 4,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 2, rollString.length, 2);
    },
    evaluate(rollString, state) {
      const loopyDigits = new Set(["0", "4", "6", "8", "9"]);

      for (const digit of rollString) {
        if (!loopyDigits.has(digit)) return null;
      }

      return {
        highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT040305",
    name: "Community",
    description: "All digits are within 3 of each other",
    requiredDigits: 3,
    baseMultiplier: () => 2,
    patternCurrencyReward: () => 8,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 1.5, rollString.length, 4);
    },
    evaluate(rollString, state) {
      if (!allDigitsWithinSpan(rollString, 3)) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT040405",
    name: "Neighborhood",
    description: "All digits are within 2 of each other",
    requiredDigits: 3,
    baseMultiplier: () => 3,
    patternCurrencyReward: () => 16,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 2, rollString.length, 4);
    },
    evaluate(rollString, state) {
      if (!allDigitsWithinSpan(rollString, 2)) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT040505",
    name: "Roommate",
    description: "All digits are within 1 of each other",
    requiredDigits: 3,
    baseMultiplier: () => 6,
    patternCurrencyReward: () => 64,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 3, rollString.length, 4);
    },
    evaluate(rollString, state) {
      if (!allDigitsWithinSpan(rollString, 1)) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT040306",
    name: "=SUM()",
    description: "First digit equals the sum of the others",
    requiredDigits: 3,
    baseMultiplier: () => 10,
    patternCurrencyReward: () => 50,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 6, rollString.length, 4);
    },
    evaluate(rollString, state) {
        const digits = getDigits(rollString);
        const first = digits[0];
        const restSum = digits.slice(1).reduce((sum, digit) => sum + digit, 0);

        if (first !== restSum) return null;

      return {
        highlightedIndices: [0],
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT040406",
    name: "=AVG()",
    description: "First digit equals the average of the others",
    requiredDigits: 3,
    baseMultiplier: () => 5,
    patternCurrencyReward: () => 15,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      const digits = getDigits(rollString);
      const first = digits[0];
      const rest = digits.slice(1);
      const avg = rest.reduce((sum, digit) => sum + digit, 0) / rest.length;

      if (Math.abs(first - avg) > 1e-9) return null;

      return {
        highlightedIndices: [0],
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040506",
    name: "=PROD()",
    description: "First digit equals the product of the others",
    requiredDigits: 3,
    baseMultiplier: () => 3,
    patternCurrencyReward: () => 25,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 5, rollString.length, 3);
    },
    evaluate(rollString, state) {
      const digits = getDigits(rollString);
      const first = digits[0];
      const restProd = digits.slice(1).reduce((prod, digit) => prod * digit, 1);

      if (first !== restProd) return null;

      return {
        highlightedIndices: [0],
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT040206",
    name: "Wormy",
    description: "All digits are within 1 of the previous",
    requiredDigits: 3,
    baseMultiplier: () => 5,
    patternCurrencyReward: () => 25,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 2, rollString.length, 4);
    },
    evaluate(rollString, state) {
      if (!allAdjacentDifferencesAtMost(rollString, 1)) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT040107",
    name: "Upstairs",
    description: "All digits increment by 1 read left to right",
    requiredDigits: 3,
    baseMultiplier: () => 5,
    patternCurrencyReward: () => 10,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 2, rollString.length, 4);
    },
    evaluate(rollString, state) {
      if (!isStrictAscendingByOne(rollString)) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT040307",
    name: "Downstairs",
    description: "All digits decrement by 1 read left to right",
    requiredDigits: 3,
    baseMultiplier: () => 5,
    patternCurrencyReward: () => 10,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    getMultiplierData(rollString, state) {
        return getMultiplierDataPower(this.baseMultiplier(), 2, rollString.length, 4);
    },
    evaluate(rollString, state) {
      if (!isStrictDescendingByOne(rollString)) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        ...this.getMultiplierData(rollString, state)
      };
    }
  },

  {
    id: "PAT040500",
    name: "Six Seven",
    description: "Roll contains 67",
    requiredDigits: 2,
    baseMultiplier: () => 67,
    patternCurrencyReward: () => 67,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("67")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "67"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040501",
    name: "WYSI",
    description: "Roll contains 727",
    requiredDigits: 3,
    baseMultiplier: () => 727,
    patternCurrencyReward: () => 727,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("727")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "727"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040502",
    name: "Twenty One",
    description: "Roll contains 21",
    requiredDigits: 3,
    baseMultiplier: () => 19,
    patternCurrencyReward: () => 19,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("21")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "21"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040503",
    name: "Gravity(-ish)",
    description: "Roll contains 981",
    requiredDigits: 3,
    baseMultiplier: () => 981,
    patternCurrencyReward: () => 981,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("981")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "981"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040504",
    name: "8-bit",
    description: "Roll contains 256",
    requiredDigits: 3,
    baseMultiplier: () => 256,
    patternCurrencyReward: () => 256,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("256")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "256"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040600",
    name: "hEll",
    description: "Roll contains 1134",
    requiredDigits: 4,
    baseMultiplier: () => 1134,
    patternCurrencyReward: () => 1134,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("1134")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "1134"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040601",
    name: "Immature",
    description: "Roll contains 8008",
    requiredDigits: 4,
    baseMultiplier: () => 8008,
    patternCurrencyReward: () => 8008,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("8008")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "8008"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040602",
    name: "IT'S OVER 9000!!!",
    description: "Roll value exceeds 90...00 (scales with digits)",
    requiredDigits: 4,
    baseMultiplier: () => 9,
    patternCurrencyReward: () => 9,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (Number(rollString) <= Math.pow(10, rollString.length) * 0.9) return null;

      return {
        highlightedIndices: highlightAll(rollString),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040603",
    name: "Dystopia",
    description: "Roll contains 1984",
    requiredDigits: 4,
    baseMultiplier: () => 1984,
    patternCurrencyReward: () => 1984,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("1984")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "1984"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040604",
    name: "Perfect Vision",
    description: "Roll contains 2020",
    requiredDigits: 4,
    baseMultiplier: () => 2020,
    patternCurrencyReward: () => 2020,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("2020")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "2020"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040700",
    name: "Elite",
    description: "Roll contains 1337",
    requiredDigits: 4,
    baseMultiplier: () => 1337,
    patternCurrencyReward: () => 1337,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("1337")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "1337"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040701",
    name: "Cannabis",
    description: "Roll contains 420",
    requiredDigits: 3,
    baseMultiplier: () => 420,
    patternCurrencyReward: () => 420,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("420")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "420"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040702",
    name: "x86 Architecture",
    description: "Roll contains 86",
    requiredDigits: 2,
    baseMultiplier: () => 86,
    patternCurrencyReward: () => 86,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("86")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "86"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040703",
    name: "Secure Password",
    description: "Roll contains 1234",
    requiredDigits: 4,
    baseMultiplier: () => 1234,
    patternCurrencyReward: () => 1234,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("1234")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "1234"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040704",
    name: "Moles",
    description: "Roll contains 602",
    requiredDigits: 3,
    baseMultiplier: () => 602,
    patternCurrencyReward: () => 602,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("602")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "602"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040800",
    name: "Engineer's Pi",
    description: "Roll contains 314",
    requiredDigits: 3,
    baseMultiplier: () => 314,
    patternCurrencyReward: () => 314,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("314")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "314"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040801",
    name: "Nice",
    description: "Roll contains 69",
    requiredDigits: 2,
    baseMultiplier: () => 69,
    patternCurrencyReward: () => 69,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("69")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "69"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040802",
    name: "Aliens",
    description: "Roll contains 52",
    requiredDigits: 2,
    baseMultiplier: () => 52,
    patternCurrencyReward: () => 52,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("52")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "52"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040803",
    name: "Not Found",
    description: "Roll contains 404",
    requiredDigits: 3,
    baseMultiplier: () => 404,
    patternCurrencyReward: () => 404,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("404")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "404"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  },

  {
    id: "PAT040804",
    name: "Answer to Life",
    description: "Roll contains 42",
    requiredDigits: 2,
    baseMultiplier: () => 42,
    patternCurrencyReward: () => 42,
    visibleWhen: () => true,
    unlockedWhen(state) { return Boolean(state.upgrades[this.id]); },
    evaluate(rollString, state) {
      if (!rollString.includes("42")) return null;

      return {
        highlightedIndices: getSubstringIndices(rollString, "42"),
        baseMultiplier: this.baseMultiplier()
      };
    }
  }
];