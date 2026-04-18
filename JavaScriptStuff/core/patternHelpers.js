export function numberStringToValue(rollString) {
  return Number.parseInt(rollString, 10);
}

export function sumDigits(rollString) {
  return [...rollString].reduce((sum, digit) => sum + Number(Digit), 0);
}

export function isNthPower(rollString, n) {
  const value = Number(rollString);
  if (value < 1) return false;
  
  const root = Math.pow(value, 1/n);
  const rounded = Math.round(root);

  return (Math.pow(rounded, n) - value) < 0.00000001;
}