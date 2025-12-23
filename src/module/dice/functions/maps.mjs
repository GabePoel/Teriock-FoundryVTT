//noinspection EqualityComparisonWithCoercionJS,JSUnusedGlobalSymbols

/**
 * Map an integer to a polyhedral die.
 * @param {number} n
 * @returns {number}
 */
export function poly(n) {
  if (n < 1) {
    return 0;
  } else if (n < 7) {
    return n * 2;
  } else if (n === 7) {
    return 20;
  } else if (n >= 8) {
    return 100;
  }
}
