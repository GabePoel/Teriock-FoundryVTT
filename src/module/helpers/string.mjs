/**
 * Converts a string to camelCase format.
 * @param {string} str - The string to convert.
 * @returns {string} The camelCase version of the string.
 */
export function toCamelCase(str) {
  return str
    .toLowerCase()
    .replace(/[-\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[a-z]/, (c) => c.toLowerCase());
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
    .replace(/\s+/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
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
