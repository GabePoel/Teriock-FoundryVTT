import { toCamelCase } from "../../../../helpers/utils.mjs";

/**
 * Parse raw HTML content for a property.
 *
 * @param {TeriockPropertyData} propertyData
 * @param {string} rawHTML
 * @returns {Promise<object>}
 * @private
 */
export async function _parse(propertyData, rawHTML) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHTML, "text/html");

  doc.querySelectorAll(".ability-sub-container").forEach((el) => el.remove());

  const name = propertyData.parent.name;
  const key = toCamelCase(name);
  let form = "normal";
  let material = false;
  if (CONFIG.TERIOCK.equipmentOptions.properties[key]) {
    form = "intrinsic";
  } else if (CONFIG.TERIOCK.equipmentOptions.magicalProperties[key]) {
    form = "normal";
  } else if (CONFIG.TERIOCK.equipmentOptions.materialProperties[key]) {
    form = "intrinsic";
    material = true;
  }
  if (key === "legendary") {
    form = "special";
  } else if (key === "cumbersome") {
    form = "flaw";
  }

  const referenceProperty = new ActiveEffect({
    name: "Reference Property",
    type: "property",
  });
  const parameters = {
    system: foundry.utils.deepClone(referenceProperty.system).toObject(),
  };

  parameters.changes = extractChangesFromHTML(rawHTML);
  parameters.description = doc.querySelector("body").innerHTML;
  parameters.system.description = parameters.description;
  parameters.system.form = form;
  if (material) {
    parameters.system.damageType = name;
  }
  return parameters;
}

/**
 * Extracts changes from HTML content.
 * Finds change metadata elements and extracts their key, mode, value, and priority.
 *
 * @param {string} html - The HTML content to extract changes from.
 * @returns {Array} Array of change objects with key, mode, value, and priority.
 * @private
 */
function extractChangesFromHTML(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  const changes = [];
  tempDiv
    .querySelectorAll("span.metadata[data-type='change']")
    .forEach((el) => {
      if (!(el instanceof HTMLElement)) return [];
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
