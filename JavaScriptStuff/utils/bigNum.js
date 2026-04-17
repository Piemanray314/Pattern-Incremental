export function makeBigNum(mantissa = 0, exponent = 0) {
  if (mantissa === 0) return { mantissa: 0, exponent: 0 };
  return normalize({ mantissa, exponent });
}

export function fromNumber(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return { mantissa: 0, exponent: 0 };
  }

  const exponent = Math.floor(Math.log10(value));
  const mantissa = value / Math.pow(10, exponent);
  return normalize({ mantissa, exponent });
}

export function cloneBigNum(value) {
  return { mantissa: value.mantissa, exponent: value.exponent };
}

export function normalize(value) {
  if (!value || value.mantissa === 0) {
    return { mantissa: 0, exponent: 0 };
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
  if (a.mantissa === 0) return cloneBigNum(b);
  if (b.mantissa === 0) return cloneBigNum(a);

  const exponentDiff = a.exponent - b.exponent;

  if (exponentDiff >= 16) return cloneBigNum(a);
  if (exponentDiff <= -16) return cloneBigNum(b);

  if (exponentDiff >= 0) {
    return normalize({
      mantissa: a.mantissa + b.mantissa / Math.pow(10, exponentDiff),
      exponent: a.exponent
    });
  }

  return normalize({
    mantissa: a.mantissa / Math.pow(10, -exponentDiff) + b.mantissa,
    exponent: b.exponent
  });
}

export function multiplyBigNum(a, b) {
  if (a.mantissa === 0 || b.mantissa === 0) {
    return { mantissa: 0, exponent: 0 };
  }

  return normalize({
    mantissa: a.mantissa * b.mantissa,
    exponent: a.exponent + b.exponent
  });
}

export function multiplyBigNumByNumber(a, n) {
  if (a.mantissa === 0 || n === 0) return { mantissa: 0, exponent: 0 };
  return normalize({
    mantissa: a.mantissa * n,
    exponent: a.exponent
  });
}

export function compareBigNum(a, b) {
  if (a.exponent !== b.exponent) {
    return a.exponent > b.exponent ? 1 : -1;
  }

  if (a.mantissa === b.mantissa) return 0;
  return a.mantissa > b.mantissa ? 1 : -1;
}

export function bigNumToString(value) {
  if (value.mantissa === 0) return "0";

  if (value.exponent < 6) {
    return (value.mantissa * Math.pow(10, value.exponent)).toFixed(2).replace(/\.00$/, "");
  }

  return `${value.mantissa.toFixed(2)}e${value.exponent}`;
}