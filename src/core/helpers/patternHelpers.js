// Scales currentMultiplier with the length of the string by a power
export function getMultiplierDataPower(baseMultiplier, power, length, minimumLength = 3) {
  const currentMultiplier =
    baseMultiplier * Math.pow(power, Math.max(0, length - minimumLength));

  return {
    baseMultiplier,
    currentMultiplier
  };
}

// For highlights all digits
export function highlightAll(rollString) {
  return Array.from({ length: rollString.length }, (_, i) => i);
}

// For highlighting all substrings
export function getSubstringIndices(str, sub) {
  return [...str].map((_, i) => str.slice(i, i + sub.length) === sub
      ? Array.from({ length: sub.length }, (_, j) => i + j) 
      : []).flat();
} 

// Returns the numerical value of a roll
export function numberStringToValue(rollString) {
  return Number.parseInt(rollString, 10);
}

// Returns the sum of all digits in a roll
export function sumDigits(rollString) {
  return [...rollString].reduce((sum, digit) => sum + Number(digit), 0);
}

// Returns if a roll is a given power
export function isNthPower(rollString, n) {
  const value = Number(rollString);
  if (value < 1) return false;
  
  const root = Math.pow(value, 1/n);
  const rounded = Math.round(root);

  return (Math.abs(Math.pow(rounded, n) - value)) < 0.00000001;
}

// Returns all digits as a numerical array
export function getDigits(rollString) {
  return [...rollString].map(Number);
}

// Returns all digits and their frequency
export function getDigitCounts(rollString) {
  const counts = {};

  for (const digit of rollString) {
    counts[digit] = (counts[digit] ?? 0) + 1;
  }

  return counts;
}

// Returns how many distinct digit values appear
export function countDistinctDigits(rollString) {
  return new Set(rollString).size;
}

// Returns indices of every at least minRunLength-in-a-row equal digits
export function getConsecutiveEqualIndices(rollString, minRunLength = 2) {
  const out = [];

  let start = 0;
  while (start < rollString.length) {
    let end = start + 1;

    while (end < rollString.length && rollString[end] === rollString[start]) {
      end++;
    }

    if (end - start >= minRunLength) {
      for (let i = start; i < end; i++) {
        out.push(i);
      }
    }

    start = end;
  }

  return out;
}

// Returns whether every neighboring pair differs by at most maxStep
export function allAdjacentDifferencesAtMost(rollString, maxStep) {
  const digits = getDigits(rollString);

  for (let i = 1; i < digits.length; i++) {
    if (Math.abs(digits[i] - digits[i - 1]) > maxStep) {
      return false;
    }
  }

  return true;
}

// Returns whether digits increase by exactly 1 each step
export function isStrictAscendingByOne(rollString) {
  const digits = getDigits(rollString);

  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i - 1] + 1) {
      return false;
    }
  }

  return true;
}

// Returns whether digits decrease by exactly 1 each step
export function isStrictDescendingByOne(rollString) {
  const digits = getDigits(rollString);

  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i - 1] - 1) {
      return false;
    }
  }

  return true;
}

// a_b pattern, like 727
export function getMiniSandwichIndices(rollString) {
  const out = [];

  for (let i = 0; i <= rollString.length - 3; i++) {
    if (
      rollString[i] === rollString[i + 2] &&
      rollString[i] !== rollString[i + 1]
    ) {
      out.push(i, i + 2);
    }
  }

  return [...new Set(out)];
}

// a...a with at least minGap digits inside
export function getSandwichIndices(rollString, minGap = 2) {
  const out = [];

  for (let i = 0; i < rollString.length; i++) {
    for (let j = i + minGap + 1; j < rollString.length; j++) {
      if (rollString[i] === rollString[j]) {
        out.push(i, j);
      }
    }
  }

  return [...new Set(out)];
}

// Checks whether max digit - min digit <= span
export function allDigitsWithinSpan(rollString, span) {
  const digits = getDigits(rollString);
  const min = Math.min(...digits);
  const max = Math.max(...digits);
  return max - min <= span;
}

// Average of adjacent digits
export function averageAdjacentDifference(rollString) {
  const digits = getDigits(rollString);
  if (digits.length < 2) return 0;

  let total = 0;
  for (let i = 1; i < digits.length; i++) {
    total += Math.abs(digits[i] - digits[i - 1]);
  }

  return total / (digits.length - 1);
}

// For unique and all even/odd
export function hasUniqueParityDigits(rollString, parity) {
  const digits = getDigits(rollString);
  const seen = new Set();

  for (const digit of digits) {
    if (digit % 2 !== parity) return false;
    if (seen.has(digit)) return false;
    seen.add(digit);
  }

  return true;
}

// Checks if a digit is at least X away from all others
export function hasOutlierDigit(rollString, minDifference) {
  const digits = getDigits(rollString);

  for (let i = 0; i < digits.length; i++) {
    let works = true;

    for (let j = 0; j < digits.length; j++) {
      if (i === j) continue;

      if (Math.abs(digits[i] - digits[j]) < minDifference) {
        works = false;
        break;
      }
    }

    if (works) return i;
  }

  return -1;
}

// Highlights all digits with X digits
export function getIndicesWithCount(rollString, targetCount) {
  const counts = getDigitCounts(rollString);

  return [...rollString]
    .map((digit, index) => counts[digit] === targetCount ? index : null)
    .filter((index) => index !== null);
}

// Checks if the rollString can be written as a power of the base
export function isPowerOfBase(rollString, base) {
  let value = Number(rollString);

  if (!Number.isInteger(value) || value < 1) return false;
  if (base < 2) return false;

  while (value % base === 0) {
    value /= base;
  }

  return value === 1;
}