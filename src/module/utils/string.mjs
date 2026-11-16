/**
 * Checks if a string is in `camelCase` format.
 * @param {string} str
 * @returns {boolean}
 */
export function isCamelCase(str) {
  return /^[a-z][a-zA-Z0-9]*$/.test(str);
}

/**
 * Checks if a string is a kebab-case slug.
 * @param {string} str
 * @returns {boolean}
 */
export function isSlug(str) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(str);
}

/** It's diacritics. */
const DIACRITICS = /[\u0300-\u036f]/g;

/**
 * Converts a string to `camelCase` format.
 * @param {string} str - The string to convert.
 * @returns {string} The camelCase version of the string.
 */
export function toCamelCase(str) {
  return isCamelCase(str)
    ? str
    : str.normalize("NFD").replace(DIACRITICS, "").replaceAll("'", "").toLowerCase().replace(
      /[^a-z0-9]+(.)/gi,
      (_, c) => c.toUpperCase(),
    ).replace(/[^a-z0-9]/gi, "").replace(/^[A-Z]/, c => c.toLowerCase());
}

/**
 * Converts a string to a kebab-case slug.
 * @param {string} str
 * @param {object} [options]
 * @param {boolean} [options.convertCamel] - Separate camelCase words.
 * @returns {Slug}
 */
export function toSlug(str, { convertCamel = false } = {}) {
  if (convertCamel) { str = str.replace(/([a-z0-9])([A-Z])/g, "$1-$2"); }
  return str.stripDiacritics().slugify({ strict: true });
}

/**
 * Join with a dot.
 * @param {string[]} strings
 * @returns {string}
 */
export function dotJoin(strings) {
  return strings.filterJoin(" · ");
}

/**
 * Converts a string to an ID.
 * @param {string} str
 * @param {object} [options]
 * @param {boolean} [options.hash]
 * @returns {ID<*>}
 */
export function toId(str, options = {}) {
  if (options.hash) {
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
  return toCamelCase(str).slice(0, 16).padEnd(16, "0");
}

/**
 * Remove indentation from a code block.
 * @param {string} str
 * @returns {string}
 */
export function dedent(str) {
  const lines = str.split("\n");
  const minIndent = Math.min(...lines.filter(line => line.trim()).map(line => line.search(/\S/)));
  return lines.map(line => line.slice(minIndent)).join("\n");
}

/**
 * Get a path relative to the Teriock system root.
 * @param path
 * @returns {string}
 */
export function systemPath(path) {
  return `systems/teriock/src/${path}`;
}
