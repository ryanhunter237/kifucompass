import { millify } from "millify";

const MAX_LENGTH = 4;

function clampToLength(value) {
  if (value.length <= MAX_LENGTH) {
    return value;
  }
  return value.slice(0, MAX_LENGTH);
}

export function formatMoveCount(count) {
  if (!Number.isFinite(count)) {
    return "";
  }

  const absolute = Math.abs(count);
  if (absolute < 1000) {
    const strValue = Math.round(count).toString();
    return clampToLength(strValue);
  }

  for (let precision = 1; precision >= 0; precision -= 1) {
    const formatted = millify(count, { precision });
    if (formatted.length <= MAX_LENGTH) {
      return formatted;
    }
  }

  const fallback = millify(count, { precision: 0 });
  return clampToLength(fallback);
}
