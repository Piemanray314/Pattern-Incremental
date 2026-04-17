export function formatNumber(value) {
  if (!Number.isFinite(value)) return "Infinity";

  if (Math.abs(value) < 1000) {
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2);
  }

  const suffixes = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"];
  let num = value;
  let index = -1;

  while (Math.abs(num) >= 1000 && index < suffixes.length - 1) {
    num /= 1000;
    index++;
  }

  return `${num.toFixed(2)}${suffixes[index]}`;
}

export function formatMultiplier(value) {
  return `${trimTrailingZeros(value)}x`;
}

export function trimTrailingZeros(value) {
  if (Number.isInteger(value)) return String(value);
  return Number(value.toFixed(2)).toString();
}