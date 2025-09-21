import { safeParseHTML } from "../../../helpers/html.mjs";

/**
 * Extracts categories from HTML.
 * @param {string} htmlString
 * @returns {Set<string>}
 */
export function getCategoriesFromHTML(htmlString) {
  const htmlElement = safeParseHTML(htmlString);
  const categories = new Set();
  htmlElement
    .querySelectorAll("span.metadata[data-type='category']")
    .forEach((el) => {
      if (el instanceof HTMLElement) {
        const category = el.dataset.category;
        categories.add(category);
      }
    });
  return categories;
}
