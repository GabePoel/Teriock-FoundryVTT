/**
 * Make a CSS class for a given array of elements.
 * @param {Set<Teriock.Keys.Element>} elements
 * @returns {string}
 */
export function elementClass(elements) {
  if (elements.size !== 1) { return "es-multi"; }
  return `es-${Array.from(elements)[0]}`;
}

/**
 * Create an element with pre-defined attributes. These can use the normal foundry "." notation.
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tagName
 * @param {Partial<HTMLElementTagNameMap[K]> & object} [attributes]
 * @returns {HTMLElementTagNameMap[K]}
 */
export function createElement(tagName, attributes = {}) {
  const element = document.createElement(tagName);
  for (const [k, v] of Object.entries(foundry.utils.flattenObject(attributes))) {
    if (k.includes(".")) { foundry.utils.setProperty(element, k, v); }
    else { element[k] = v; }
  }
  return element;
}
