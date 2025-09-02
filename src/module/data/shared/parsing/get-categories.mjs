/**
 * Extracts categories from HTML.
 * @param {string} html
 * @returns {Set<string>}
 */
export function getCategoriesFromHTML(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const categories = new Set();
  tempDiv.querySelectorAll("span.metadata[data-type='category']").forEach((el) => {
    if (el instanceof HTMLElement) {
      const category = el.dataset.category;
      categories.add(category);
    }
  })
  return categories;
}