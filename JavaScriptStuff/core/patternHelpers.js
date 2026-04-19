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