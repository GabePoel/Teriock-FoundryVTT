/**
 * Helper function to ensure a value with a min and max is allowed.
 * @param {Teriock.Fields.BarField} bar
 * @param {number} change
 * @returns {number}
 */
export function barClamp(bar, change) {
  return Math.clamp(bar.value + change, bar.min, bar.max);
}

/**
 * Ensure infinities are just large numbers for roll data.
 * @param {number} n
 * @returns {number}
 */
export function safeInf(n) {
  return n === Infinity ? TERIOCK.CONST.SAFE_INF : n;
}
