import { formulaExists } from "./formula.mjs";

/**
 * Converts a string to camelCase format.
 * @param {string} str - The string to convert.
 * @returns {string} The camelCase version of the string.
 */
export function toCamelCase(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/'/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/gi, (_, c) => c.toUpperCase())
    .replace(/[^a-z0-9]/gi, "")
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}

/**
 * Converts a string to Title Case format.
 * @param {string} str - The string to convert.
 * @returns {string} The Title Case version of the string.
 */
export function toTitleCase(str) {
  return str
    .toLowerCase()
    .replace(/(?:^|\s|-)\w/g, (match) => match.toUpperCase());
}

/**
 * Converts a string to kebab-case format.
 * @param {string} str - The string to convert.
 * @returns {string} The kebab-case version of the string.
 */
export function toKebabCase(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/'/g, "")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

/**
 * Convert a string to kebab-case format. Handles camel case and acronyms.
 * @param {string} str - The string to convert.
 * @returns {string} The kebab-case version of the string.
 */
export function toKebabCaseFull(str) {
  return str
    .replace(/[\s_]+/g, "-")
    .replace(/([a-z\d])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Converts a string to an integer.
 * @param {string} str
 * @returns {number}
 */
export function toInt(str) {
  const result = parseInt(str, 10);
  if (isNaN(result)) {
    return 0;
  }
  return result;
}

/**
 * Join with a dot.
 * @param {string[]} strings
 * @returns {string}
 */
export function dotJoin(strings) {
  strings = strings.filter((s) => s);
  return strings.join(" · ");
}

/**
 * Converts a string to an ID.
 * @param {string} str
 * @param {object} [options]
 * @param {boolean} [options.hash]
 * @param {number} [options.length]
 * @param {string} [options.background]
 * @returns {string}
 */
export function toId(str, options = {}) {
  const {
    background = "0000000000000000",
    length = 16,
    hash = false,
  } = options;
  if (hash) {
    const FNV_OFFSET_64 = 0xcbf29ce484222325n;
    const FNV_PRIME_64 = 0x100000001b3n;
    const MASK_64 = (1n << 64n) - 1n;
    let val = FNV_OFFSET_64;
    for (let i = 0; i < str.length; i++) {
      val ^= BigInt(str.charCodeAt(i));
      val = (val * FNV_PRIME_64) & MASK_64;
    }
    return val.toString(16).padStart(16, "0");
  }
  const camel = toCamelCase(str);
  return camel.slice(0, length) + background.slice(camel.length);
}

/**
 * Add a suffix to a string if it exists.
 * @param {string|number} base
 * @param {string} suffix
 * @param {string} space
 */
export function suffix(base, suffix, space = " ") {
  if (formulaExists(base)) {
    return `${base}${space}${suffix}`;
  }
  return "";
}

/**
 * Add a suffix to a string if it exists.
 * @param {string|number} base
 * @param {string} prefix
 * @param {string} space
 */
export function prefix(base, prefix, space = " ") {
  if (formulaExists(base)) {
    return `${prefix}${space}${base}`;
  }
  return "";
}
/**
 * Remove indentation from code block.
 * @param {string} str
 * @returns {string}
 */
export function dedent(str) {
  const lines = str.split("\n");
  const minIndent = lines
    .filter((line) => line.trim())
    .reduce((min, line) => {
      const match = line.match(/^(\s*)/);
      return Math.min(min, match ? match[1].length : 0);
    }, Infinity);
  return lines.map((line) => line.slice(minIndent)).join("\n");
}

/**
 * Make the first character of a string upper case.
 * @param {string} str
 * @returns {string}
 */
export function ucFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
