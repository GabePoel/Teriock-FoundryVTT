import { toCamelCase } from "../../../../helpers/utils.mjs";
import { extractChangesFromHTML } from "../../../shared/parsing/extract-changes.mjs";

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

