import { isBigNum, toBigNum, bigNumToScientificString } from "./bigNum.js";

let currentNumberFormatMode = "standard";

export function setNumberFormatMode(mode) {
  currentNumberFormatMode = mode;
}

export function formatNumber(value, mode = currentNumberFormatMode) {
  if (isBigNum(value)) {
    return formatBigNum(value, mode);
  }

  if (!Number.isFinite(value)) return "Infinity";

  if (Math.abs(value) < 1000) {
    if (Number.isInteger(value)) return String(value);
    return trimTrailingZeros(value);
  }

  if (mode === "scientific") {
    return value.toExponential(2).replace("+", "");
  }

  if (mode === "letters") {
    return formatSmallNumberWithLetters(value);
  }

  return formatSmallNumberWithStandardSuffixes(value);
}

export function formatMultiplier(value, mode = currentNumberFormatMode) {
  return `${formatNumber(value, mode)}x`;
}

export function trimTrailingZeros(value) {
  if (typeof value !== "number") return String(value);
  if (Number.isInteger(value)) return String(value);
  return Number(value.toFixed(2)).toString();
}

function formatBigNum(value, mode) {
  const big = toBigNum(value);
  if (big.mantissa === 0) return "0";

  if (mode === "scientific") {
    return bigNumToScientificString(big, 2);
  }

  if (mode === "letters") {
    return formatBigNumWithLetters(big);
  }

  return formatBigNumWithStandardSuffixes(big);
}

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