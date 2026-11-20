import { asInf, formatGp, toClass, toSlug } from "../../utils/_module.mjs";

/**
 * Show a string only if it's at least as long as some specified length.
 * @param {string|number} value
 * @param {number} length
 */
function minLen(value, length) {
  if (typeof value === "number") { value = value.toString(); }
  return value.length >= length ? value : "";
}

export default { asInf, formatGp, minLen, toClass, toSlug, toNearest: (n, interval) => Number(n).toNearest(interval) };
