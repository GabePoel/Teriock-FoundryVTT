import { asInf } from "../../helpers/icon.mjs";
import { toClass, toKebabCase } from "../../helpers/string.mjs";

/**
 * Show a string only if it's at least as long as some specified length.
 * @param {string|number} value
 * @param {number} length
 */
function minLen(value, length) {
  if (typeof value === "number") { value = value.toString(); }
  return value.length >= length ? value : "";
}

export default { asInf, minLen, toClass, toKebabCase };
