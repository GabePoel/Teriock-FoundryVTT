/**
 * Checks if a string is in `camelCase` format.
 * @param {string} str
 * @returns {boolean}
 */
export function isCamelCase(str) {
  return /^[a-z][a-zA-Z0-9]*$/.test(str);
}

/**
 * Checks if a string is in `kebab-case` format.
 * @param {string} str
 * @returns {boolean}
 */
export function isKebabCase(str) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(str);
}

/**
 * Converts a string to `camelCase` format.
 * @param {string} str - The string to convert.
 * @returns {string} The camelCase version of the string.
 */
export function toCamelCase(str) {
  return isCamelCase(str)
    ? str
    : str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/'/g, "").toLowerCase().replace(
      /[^a-z0-9]+(.)/gi,
      (_, c) => c.toUpperCase(),
    ).replace(/[^a-z0-9]/gi, "").replace(/^[A-Z]/, c => c.toLowerCase());
}

/**
 * Converts a string to `kebab-case` format.
 * @param {string} str - The string to convert.
 * @returns {string} The kebab-case version of the string.
 */
export function toKebabCase(str) {
  return isKebabCase(str)
    ? str
    : str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/'/g, "").replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-+|-+$/g, "");
}

/**
 * Join with a dot.
 * @param {string[]} strings
 * @returns {string}
 */
export function dotJoin(strings) {
  return strings.filter(s => s).join(" · ");
}

/**
 * Join CSS classes into a className string.
 * @param {Iterable<string>|string|null|undefined} [classes]
 * @returns {string}
 */
export function toClass(classes) {
  if (classes == null || classes === "") { return ""; }
  if (typeof classes === "string") { return classes; }
  if (typeof classes?.[Symbol.iterator] === "function") { return Array.from(classes).filter(Boolean).join(" "); }
  return "";
}

/**
 * Converts a string to an ID.
 * @param {string} str
 * @param {object} [options]
 * @param {boolean} [options.hash]
 * @param {number} [options.length]
 * @param {string} [options.background]
 * @returns {ID<*>}
 */
export function toId(str, options = {}) {
  const { background = "0000000000000000", hash = false, length = 16 } = options;
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
 * Remove indentation from a code block.
 * @param {string} str
 * @returns {string}
 */
export function dedent(str) {
  const lines = str.split("\n");
  const minIndent = lines.filter(line => line.trim()).reduce((min, line) => {
    const match = line.match(/^(\s*)/);
    return Math.min(min, match ? match[1].length : 0);
  }, Infinity);
  return lines.map(line => line.slice(minIndent)).join("\n");
}
