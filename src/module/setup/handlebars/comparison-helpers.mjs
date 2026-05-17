import { comparisons } from "../../dice/functions/_module.mjs";

/**
 * Whether an iterable includes a certain element.
 * @template T
 * @param {Iterable<T>} list
 * @param {T} item
 * @returns {boolean}
 */
function includes(list, item) {
  return list ? Array.from(list).includes(item) : false;
}

/**
 * True when `test` doesn't match the `reference` pattern.
 * @param {string} reference - Regex source string.
 * @param {string} test - String to test.
 * @returns {boolean}
 */
function rgx(reference, test) {
  return !!reference && !new RegExp(reference, "i").test(test);
}

const comparisonHelperEntries = [...Object.entries(comparisons), ["includes", includes], ["rgx", rgx]];

export default comparisonHelperEntries;
