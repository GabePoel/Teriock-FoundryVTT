import { safeParseHTML } from "../../../helpers/html.mjs";

/**
 * Extracts changes from HTML content.
 * Finds change metadata elements and extracts their key, mode, value, and priority.
 * @param {string} htmlString - The HTML content to extract changes from.
 * @returns {EffectChangeData[]} Array of change objects with a key, mode, value, and priority.
 */
export function extractChangesFromHTML(htmlString) {
  const htmlElement = safeParseHTML(htmlString);
  const changes = [];
  htmlElement
    .querySelectorAll("span.metadata[data-type='change']")
    .forEach((el) => {
      if (!(el instanceof HTMLElement)) {
        return [];
      }
      let key = el.dataset.key;
      for (const prefix of [
        "immunities",
        "resistances",
        "hexproofs",
        "hexseals",
      ]) {
        if (key.startsWith(`system.${prefix}`)) {
          key = key.replace(`system.${prefix}`, `system.protections.${prefix}`);
        }
      }
      const mode = el.dataset.mode;
      const value = el.dataset.value;
      const priority = el.dataset.priority;
      const time = el.dataset.time || "normal";
      const target = el.dataset.target || "Actor";
      const qualifier = el.dataset.qualifier || "1";
      if (key && mode !== undefined && value !== undefined) {
        changes.push({
          key,
          mode: parseInt(mode, 10),
          priority: priority ? parseInt(priority, 10) : 20,
          target,
          time,
          qualifier,
          value: value === "true" ? true : value === "false" ? false : value,
        });
      }
    });
  return changes;
}
