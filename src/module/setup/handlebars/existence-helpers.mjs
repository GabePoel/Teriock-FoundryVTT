/**
 * Check if a value is defined.
 * @param {*|undefined} val
 * @returns {boolean}
 */
function defined(val) {
  return typeof val !== "undefined";
}

/**
 * Flexible helper to check if something exists.
 * @param {object|string|number} val
 * @returns {boolean}
 */
function exists(val) {
  if (Array.isArray(val)) { return val.length > 0; }
  if (val === undefined || val === null) { return false; }
  if (typeof val === "object") { return Object.keys(val).length > 0; }
  if (typeof val === "string") { return !(val.trim() === "" || val === "0" || val === "+0"); }
  if (typeof val === "number") { return val > 0; }
  return true;
}

/**
 * Repeat an inner template `n` times.
 * @param {number} n
 * @param {object} options
 * @returns {string}
 */
function repeat(n, options) {
  let result = "";
  for (let i = 0; i < n; i++) { result += options.fn(this); }
  return new Handlebars.SafeString(result);
}

/**
 * Repeat a string `n` times.
 * @param {number} n
 * @param {string} block
 * @returns {string}
 */
function repeatStr(n, block) {
  return new Handlebars.SafeString(block.repeat(n));
}

/**
 * Merge two objects.
 * @param {object} a
 * @param {object} b
 * @returns {object}
 */
function merge(a, b) {
  return foundry.utils.mergeObject(a ?? {}, b ?? {});
}

const existenceHelperEntries = [["defined", defined], ["exists", exists], ["merge", merge], ["repeat", repeat], [
  "repeatStr",
  repeatStr,
]];

export default existenceHelperEntries;
