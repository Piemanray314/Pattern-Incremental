export function isBigNum(value) {
  return Boolean(
    value &&
    typeof value === "object" &&
    typeof value.mantissa === "number" &&
    typeof value.exponent === "number"
  );
}

export function makeBigNum(mantissa = 0, exponent = 0) {
  if (!Number.isFinite(mantissa) || mantissa === 0) {
    return { mantissa: 0, exponent: 0 };
  }

  return normalize({ mantissa, exponent });
}

export function zeroBigNum() {
  return { mantissa: 0, exponent: 0 };
}

export function oneBigNum() {
  return { mantissa: 1, exponent: 0 };
}

export function fromNumber(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return zeroBigNum();
  }

  const exponent = Math.floor(Math.log10(value));
  const mantissa = value / Math.pow(10, exponent);
  return normalize({ mantissa, exponent });
}

export function toBigNum(value) {
  if (isBigNum(value)) return normalize(value);
  if (typeof value === "number") return fromNumber(value);
  return zeroBigNum();
}

export function cloneBigNum(value) {
  const normalized = toBigNum(value);
  return { mantissa: normalized.mantissa, exponent: normalized.exponent };
}

export function normalize(value) {
  if (!value || value.mantissa === 0 || !Number.isFinite(value.mantissa)) {
    return zeroBigNum();
  }

  let mantissa = value.mantissa;
  let exponent = value.exponent;

  while (Math.abs(mantissa) >= 10) {
    mantissa /= 10;
    exponent += 1;
  }

  while (Math.abs(mantissa) < 1 && mantissa !== 0) {
    mantissa *= 10;
    exponent -= 1;
  }

  return { mantissa, exponent };
}

export function addBigNum(a, b) {
  const left = toBigNum(a);
  const right = toBigNum(b);

  if (left.mantissa === 0) return cloneBigNum(right);
  if (right.mantissa === 0) return cloneBigNum(left);

  const exponentDiff = left.exponent - right.exponent;

  if (exponentDiff >= 16) return cloneBigNum(left);
  if (exponentDiff <= -16) return cloneBigNum(right);

  if (exponentDiff >= 0) {
    return normalize({
      mantissa: left.mantissa + right.mantissa / Math.pow(10, exponentDiff),
      exponent: left.exponent
    });
  }

  return normalize({
    mantissa: left.mantissa / Math.pow(10, -exponentDiff) + right.mantissa,
    exponent: right.exponent
  });
}

export function subtractBigNum(a, b) {
  const left = toBigNum(a);
  const right = toBigNum(b);

  if (right.mantissa === 0) return cloneBigNum(left);
  if (left.mantissa === 0) return zeroBigNum();

  const exponentDiff = left.exponent - right.exponent;

  if (exponentDiff >= 16) return cloneBigNum(left);
  if (exponentDiff <= -16) return zeroBigNum();

  let result;

  if (exponentDiff >= 0) {
    result = normalize({
      mantissa: left.mantissa - right.mantissa / Math.pow(10, exponentDiff),
      exponent: left.exponent
    });
  } else {
    result = normalize({
      mantissa: left.mantissa / Math.pow(10, -exponentDiff) - right.mantissa,
      exponent: right.exponent
    });
  }

  if (result.mantissa <= 0) return zeroBigNum();
  return result;
}

export function multiplyBigNum(a, b) {
  const left = toBigNum(a);
  const right = toBigNum(b);

  if (left.mantissa === 0 || right.mantissa === 0) {
    return zeroBigNum();
  }

  return normalize({
    mantissa: left.mantissa * right.mantissa,
    exponent: left.exponent + right.exponent
  });
}

export function multiplyBigNumByNumber(a, n) {
  if (!Number.isFinite(n) || n === 0) return zeroBigNum();
  return multiplyBigNum(a, fromNumber(n));
}

export function compareBigNum(a, b) {
  const left = toBigNum(a);
  const right = toBigNum(b);

  if (left.mantissa === 0 && right.mantissa === 0) return 0;
  if (left.exponent !== right.exponent) {
    return left.exponent > right.exponent ? 1 : -1;
  }

  if (left.mantissa === right.mantissa) return 0;
  return left.mantissa > right.mantissa ? 1 : -1;
}

export function maxBigNum(a, b) {
  return compareBigNum(a, b) >= 0 ? cloneBigNum(a) : cloneBigNum(b);
}

export function floorBigNumToNumber(value) {
  const normalized = toBigNum(value);

  if (normalized.mantissa === 0) return 0;
  if (normalized.exponent > 15) return Number.MAX_SAFE_INTEGER;

  return Math.floor(normalized.mantissa * Math.pow(10, normalized.exponent));
}

export function bigNumToScientificString(value, digits = 2) {
  const normalized = toBigNum(value);
  if (normalized.mantissa === 0) return "0";
  return `${normalized.mantissa.toFixed(digits)}e${normalized.exponent}`;
}
