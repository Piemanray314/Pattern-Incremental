import { isBigNum, toBigNum, bigNumToScientificString } from "./bigNum.js";

// Formats are either standard, scientiic, or letters
let currentNumberFormatMode = "standard";

// Setter function for number format mode
export function setNumberFormatMode(mode) {
  currentNumberFormatMode = mode;
}

// Formats numbers based on the given number format mode
export function formatNumber(value, mode = currentNumberFormatMode) {
  if (isBigNum(value)) {
    return formatBigNum(value, mode);
  }

  if (!Number.isFinite(value)) return "Infinity";

  if (Math.abs(value) < 1000) {
    if (Number.isInteger(value)) return String(value);
    return trimTrailingZeros(value);
  }

  // Exponential notation without the + like 3e5 for 30000
  if (mode === "scientific") {
    return value.toExponential(2).replace("+", "");
  }

  // Letter notation, replacing thousand/million/billion with A/B/C etc.
  if (mode === "letters") {
    return formatSmallNumberWithLetters(value);
  }

  // Complete notation, skipping suffixes and instead writing out the whole word (e.g. million)
  if (mode === "complete") {
    return formatSmallNumberWithComplete(value);
  }

  // Uses traditional suffixes like K for thousand, M for million, B for billion, etc.
  return formatSmallNumberWithStandardSuffixes(value);
}

// Formats a given number into a multiplier in the given mode
export function formatMultiplier(value, mode = currentNumberFormatMode) {
  return `${formatNumber(value, mode)}×`;
}

// Trims trailing zeroes lol
export function trimTrailingZeros(value) {
  if (typeof value !== "number") return String(value);
  if (Number.isInteger(value)) return String(value);
  return Number(value.toFixed(2)).toString();
}

// Formats bigNums based on the given number format mode
function formatBigNum(value, mode) {
  const big = toBigNum(value);
  if (big.mantissa === 0) return "0";

  if (mode === "scientific") {
    return bigNumToScientificString(big, 2);
  }

  if (mode === "letters") {
    return formatBigNumWithLetters(big);
  }

  if (mode === "complete") {
    return formatBigNumWithComplete(big);
  }

  return formatBigNumWithStandardSuffixes(big);
}

// Formats regular numbers with standard suffixes
function formatSmallNumberWithStandardSuffixes(value) {
  const suffixes = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"];
  let num = value;
  let index = -1;

  while (Math.abs(num) >= 1000 && index < suffixes.length - 1) {
    num /= 1000;
    index += 1;
  }

  if (index === -1) return trimTrailingZeros(num);
  return `${trimTrailingZeros(num)}${suffixes[index]}`;
}

// Formats regular numbers with letters
function formatSmallNumberWithLetters(value) {
  if (Math.abs(value) < 1000) return trimTrailingZeros(value);

  let num = value;
  let groups = 0;

  while (Math.abs(num) >= 1000) {
    num /= 1000;
    groups += 1;
  }

  return `${trimTrailingZeros(num)}${groupIndexToLetters(groups)}`;
}

// Formats regular numbers with complete suffixes
function formatSmallNumberWithComplete(value) {
  const suffixes = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion"];
  let num = value;
  let index = -1;

  while (Math.abs(num) >= 1000 && index < suffixes.length - 1) {
    num /= 1000;
    index += 1;
  }

  if (index === -1) return trimTrailingZeros(num);
  return `${trimTrailingZeros(num)}${suffixes[index]}`;
}

// Formats bigNum with standard suffixes, using exponentials if not enough suffixes exist
function formatBigNumWithStandardSuffixes(big) {
  if (big.exponent < 6) {
    const raw = big.mantissa * Math.pow(10, big.exponent);
    return formatNumber(raw, "standard");
  }

  const group = Math.floor(big.exponent / 3);
  const withinGroupExponent = big.exponent % 3;
  const displayMantissa = big.mantissa * Math.pow(10, withinGroupExponent);

  const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"];

  if (group < suffixes.length) {
    return `${trimTrailingZeros(displayMantissa)}${suffixes[group]}`;
  }

  return bigNumToScientificString(big, 2);
}

// Formats bigNum with letters
function formatBigNumWithLetters(big) {
  if (big.exponent < 3) {
    const raw = big.mantissa * Math.pow(10, big.exponent);
    return trimTrailingZeros(raw);
  }

  const group = Math.floor(big.exponent / 3);
  const withinGroupExponent = big.exponent % 3;
  const displayMantissa = big.mantissa * Math.pow(10, withinGroupExponent);

  if (group === 0) return trimTrailingZeros(displayMantissa);
  return `${trimTrailingZeros(displayMantissa)}${groupIndexToLetters(group)}`;
}

// Deals with logic with letter formats
function groupIndexToLetters(groupIndex) {
  let n = groupIndex;
  let result = "";

  while (n > 0) {
    n -= 1;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }

  return result || "A";
}

// Deals with time in standard format
export function formatElapsedTime(ms) {
  if (ms === null || ms === undefined) return "How did you manage to error this";
  if (ms.length === 0) return "How did you manage to error this";
  
  if (!Number.isFinite(ms)) return "Infinite";

  const totalSeconds = Math.floor(ms / 1000);

  const years = Math.floor(totalSeconds / 31536000);
  const days = Math.floor((totalSeconds % 31536000) / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (years >= 1) {
    return `${years}y ${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (days >= 1) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours >= 1) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

// Formats bigNum with full short-scale names when possible
// Conway–Wechsler-style short-scale number names once things go crazy
// Here's a good overview explained: https://kyodaisuu.github.io/illion/
// Not optimized lol
function formatBigNumWithComplete(big) {
  if (big.exponent < 3) {
    const raw = big.mantissa * Math.pow(10, big.exponent);
    return formatNumber(raw, "standard");
  }

  const group = Math.floor(big.exponent / 3); // 1 = thousand, 2 = million, 3 = billion, etc.
  const withinGroupExponent = big.exponent % 3;
  const displayMantissa = big.mantissa * Math.pow(10, withinGroupExponent);

  const suffix = getShortScaleSuffix(group);
  if (!suffix) {
    return bigNumToScientificString(big, 2);
  }

  return `${trimTrailingZeros(displayMantissa)} ${suffix}`;
}

function getShortScaleSuffix(group) {
  if (group <= 0) return "";
  if (group === 1) return "Thousand";

  const n = group - 1;
  return capitalize(shortScaleIllionName(n));
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Full short-scale illion name for index n:
// 1 = million
// 10 = decillion
// 100 = centillion
// 1000 = millinillion
// Conway–Wechsler extension splits n into 3-digit chunks between commas, then join them
// [chunk1]-illi + [chunk2]-illi + ... + [lastChunk]-illion
// zero chunk => nilli / nillion
function shortScaleIllionName(n) {
  if (n <= 0) return "";

  if (n < 1000) {
    return smallIllionName(n);
  }
  const chunks = splitThousands(n);
  let out = "";

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const isLast = i === chunks.length - 1;

    if (chunk === 0) {
      out += isLast ? "nillion" : "nilli";
    } else {
      const full = smallIllionName(chunk);
      out += isLast ? full : trimIllionToIlli(full);
    }
  }

  return out;
}

// Splits n into comma chunks
function splitThousands(n) {
  const chunks = [];
  while (n > 0) {
    chunks.push(n % 1000);
    n = Math.floor(n / 1000);
  }
  chunks.reverse();
  return chunks;
}

function trimIllionToIlli(name) {
  // million -> milli
  // centillion -> centilli
  // vigintillion -> vigintilli
  if (name.endsWith("illion")) {
    return name.slice(0, -6) + "illi";
  }
  return name;
}

const SMALL_ILLIONS = {
  1: "million",
  2: "billion",
  3: "trillion",
  4: "quadrillion",
  5: "quintillion",
  6: "sextillion",
  7: "septillion",
  8: "octillion",
  9: "nonillion",
  10: "decillion",
  11: "undecillion",
  12: "duodecillion",
  13: "tredecillion",
  14: "quattuordecillion",
  15: "quindecillion",
  16: "sexdecillion",
  17: "septendecillion",
  18: "octodecillion",
  19: "novemdecillion"
};

// Prefix tables for generated names >= 20
const TENS = [
  null,
  { stem: "deci",         flags: "N"  },
  { stem: "viginti",      flags: "MS" },
  { stem: "triginta",     flags: "NS" },
  { stem: "quadraginta",  flags: "NS" },
  { stem: "quinquaginta", flags: "NS" },
  { stem: "sexaginta",    flags: "N"  },
  { stem: "septuaginta",  flags: "N"  },
  { stem: "octoginta",    flags: "MX" },
  { stem: "nonaginta",    flags: ""   }
];

const HUNDREDS = [
  null,
  { stem: "centi",        flags: "NX" },
  { stem: "ducenti",      flags: "N"  },
  { stem: "trecenti",     flags: "NS" },
  { stem: "quadringenti", flags: "NS" },
  { stem: "quingenti",    flags: "NS" },
  { stem: "sescenti",     flags: "N"  },
  { stem: "septingenti",  flags: "N"  },
  { stem: "octingenti",   flags: "MX" },
  { stem: "nongenti",     flags: ""   }
];

// Makes -illions from smaller place values to larger
function smallIllionName(n) {
  if (SMALL_ILLIONS[n]) return SMALL_ILLIONS[n];

  const ones = n % 10;
  const tens = Math.floor(n / 10) % 10;
  const hundreds = Math.floor(n / 100);

  let prefix = "";

  if (ones > 0) {
    const nextFlags =
      tens > 0 ? TENS[tens].flags :
      hundreds > 0 ? HUNDREDS[hundreds].flags :
      "";

    prefix += onesPrefix(ones, nextFlags);
  }

  if (tens > 0) {
    prefix += TENS[tens].stem;
  }

  if (hundreds > 0) {
    prefix += HUNDREDS[hundreds].stem;
  }

  prefix = dropFinalVowel(prefix);

  return prefix + "illion";
}

// Ones digit prefix
function onesPrefix(digit, nextFlags) {
  switch (digit) {
    case 1:
      return "un";
    case 2:
      return "duo";
    case 3:
      return nextFlags.includes("S") ? "tres" : "tre";
    case 4:
      return "quattuor";
    case 5:
      return "quin";
    case 6:
      if (nextFlags.includes("S")) return "ses";
      if (nextFlags.includes("X")) return "sex";
      return "se";
    case 7:
      if (nextFlags.includes("M")) return "septem";
      if (nextFlags.includes("N")) return "septen";
      return "septe";
    case 8:
      return "octo";
    case 9:
      if (nextFlags.includes("M")) return "novem";
      if (nextFlags.includes("N")) return "noven";
      return "nove";
    default:
      return "";
  }
}

// Prevents double vowels wth "illion":
// centi + illion = centillion
// triginta + illion = trigintillion
function dropFinalVowel(str) {
  const last = str.charAt(str.length - 1);
  if (last === "a" || last === "i") {
    return str.slice(0, -1);
  }
  return str;
}