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

export function divideBigNumByNumber(value, divisor) {
  if (!Number.isFinite(divisor) || divisor === 0) return zeroBigNum();

  const big = toBigNum(value);
  return makeBigNum(big.mantissa / divisor, big.exponent);
}

export function powerBigNum(a, n) {
  const left = toBigNum(a);

  if (!Number.isFinite(n) || n < 0) {
    return zeroBigNum();
  }

  if (n === 0) {
    return oneBigNum();
  }

  if (left.mantissa === 0) {
    return zeroBigNum();
  }

  if (Number.isInteger(n)) {
    return normalize({
      mantissa: Math.pow(left.mantissa, n),
      exponent: left.exponent * n
    });
  }

  const logValue = Math.log10(left.mantissa) + left.exponent;
  const poweredLog = logValue * n;
  const exponent = Math.floor(poweredLog);

  return makeBigNum(Math.pow(10, poweredLog - exponent), exponent);
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

export function minBigNum(a, b) {
  return compareBigNum(a, b) <= 0 ? cloneBigNum(a) : cloneBigNum(b);
}

export function bigNumToScientificString(value, digits = 2) {
  const normalized = toBigNum(value);
  if (normalized.mantissa === 0) return "0";
  return `${normalized.mantissa.toFixed(digits)}e${normalized.exponent}`;
}

export function serializeBigNum(value, mantissaDigits = 12) {
  const big = toBigNum(value);
  if (big.mantissa === 0) return [0, 0];

  return [roundToDigits(big.mantissa, mantissaDigits), big.exponent];
}

export function deserializeBigNum(value) {
  if (Array.isArray(value)) {
    return makeBigNum(value[0], value[1]);
  }

  return toBigNum(value);
}

export function roundBigNumMantissa(value, digits = 12) {
  const big = toBigNum(value);
  if (big.mantissa === 0) return zeroBigNum();

  return makeBigNum(roundToDigits(big.mantissa, digits), big.exponent);
}

function roundToDigits(value, digits) {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
}

// Mostly for pattern currency to not show decimals when under 1000
export function roundSmallToWholeMantissa(value) {
  const big = toBigNum(value);
  if (big.mantissa === 0) return zeroBigNum();

  if (big.exponent >= 3) {
    return cloneBigNum(big);
  }

  const smallValue = big.mantissa * Math.pow(10, big.exponent);
  return fromNumber(Math.round(smallValue));
}

// Rounding for float precision purposes, not actual rounding
export function roundMultiplierBigNum(value) {
  const big = toBigNum(value);
  if (big.mantissa === 0) return zeroBigNum();

  return makeBigNum(Math.round(big.mantissa * 1000000) / 1000000, big.exponent);
}

export function safeLog10BigNum(value) {
  const big = toBigNum(value);
  if (big.mantissa === 0) return 0;
  return Math.log10(big.mantissa) + big.exponent;
}