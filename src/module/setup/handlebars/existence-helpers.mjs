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
 * @param {*} value
 * @returns {boolean}
 */
function exists(value) {
  if (typeof value === "string") { return !(value.trim() === "" || value === "0" || value === "+0"); }
  if (typeof value === "number") { return value > 0; }
  return !foundry.utils.isEmpty(value);
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
