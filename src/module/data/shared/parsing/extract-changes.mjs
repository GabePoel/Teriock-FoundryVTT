/**
 * Extracts changes from HTML content.
 * Finds change metadata elements and extracts their key, mode, value, and priority.
 *
 * @param {string} html - The HTML content to extract changes from.
 * @returns {EffectChangeData[]} Array of change objects with a key, mode, value, and priority.
 * @private
 */
export function extractChangesFromHTML(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  const changes = [];
  tempDiv
    .querySelectorAll("span.metadata[data-type='change']")
    .forEach((el) => {
      if (!(el instanceof HTMLElement)) {
        return [];
      }
      const key = el.dataset.key;
      const mode = el.dataset.mode;
      const value = el.dataset.value;
      const priority = el.dataset.priority;
      if (key && mode !== undefined && value !== undefined) {
        changes.push({
          key,
          mode: parseInt(mode, 10),
          value: value === "true" ? true : value === "false" ? false : value,
          priority: priority ? parseInt(priority, 10) : 20,
        });
      }
    });
  return changes;
}
