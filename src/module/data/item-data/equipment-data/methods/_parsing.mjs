import { cleanValue } from "../../../../helpers/clean.mjs";
import { createProperty } from "../../../../helpers/create-effects.mjs";
import { getIcon } from "../../../../helpers/path.mjs";
import { toCamelCase, toInt } from "../../../../helpers/string.mjs";
import { _override } from "./_overrides.mjs";

/**
 * Parses raw HTML content for equipment, extracting properties and creating effects.
 * Handles damage parsing, numeric values, arrays, and property creation.
 * @param {TeriockEquipmentModel} equipmentData - The equipment data to parse content for.
 * @param {string} rawHTML - The raw HTML content to parse.
 * @returns {Promise<object>} Promise that resolves to the parsed equipment data.
 * @private
 */
export async function _parse(equipmentData, rawHTML) {
  const allValidProperties = foundry.utils.deepClone(TERIOCK.index.properties);
  const doc = new DOMParser().parseFromString(rawHTML, "text/html");
  const q = (s) => doc.querySelector(s);
  const getValue = (s) => q(s)?.getAttribute("data-val");
  const getText = (s) => q(s)?.textContent.trim();
  const getTextAll = (s) => Array.from(doc.querySelectorAll(s), (el) => el.textContent.trim());

  const referenceEquipment = new Item({
    name: "Reference Equipment",
    type: "equipment",
  });
  /** @type {Partial<TeriockEquipmentModel>} */
  const parameters = foundry.utils
    .deepClone(referenceEquipment.system)
    .toObject();

  // Parse damage
  const damageText = getText(".damage");
  parameters.damage = {
    base: {},
    twoHanded: {},
  };
  if (damageText) {
    const match = damageText.match(/^([^(]+)\s*\(([^)]+)\)/);
    parameters.damage.base.saved = match ? match[1].trim() : damageText;
    if (match) {
      parameters.damage.twoHanded.saved = match[2].trim();
    }
  }

  // Parse numeric and range values
  parameters.range = {
    long: {},
    short: {},
    ranged: false,
  };
  parameters.weight = { saved: cleanValue(getValue(".weight")) };
  parameters.range.short = { saved: cleanValue(getText(".short-range")) };
  parameters.range.long = { saved: cleanValue(getText(".normal-range")) };
  parameters.range.long = { saved: cleanValue(getText(".long-range")) };
  parameters.minStr = { saved: cleanValue(getValue(".min-str")) };

  // Parse arrays
  let equipmentClasses = new Set(getTextAll(".equipment-class"));
  let properties = new Set(getTextAll(".property"));

  // Add piercing property if present
  const piercing = getValue(".piercing");
  if (piercing) {
    properties.add(piercing.toUpperCase());
  }

  // Parse sb, av, bv
  parameters.fightingStyle = toCamelCase(getValue(".sb") || "") ?? parameters.fightingStyle;
  parameters.av = { saved: toInt(cleanValue(getValue(".av"))) || 0 };
  parameters.bv = { saved: toInt(cleanValue(getValue(".bv"))) || 0 };

  // Sort and filter properties and equipment classes
  parameters.equipmentClasses = new Set(Array.from(equipmentClasses).map((s) => toCamelCase(s)));
  const toCreate = Array.from(properties);
  const filteredProperties = toCreate.filter((p) => Object.values(allValidProperties).includes(p));
  toCreate.length = 0;
  toCreate.push(...filteredProperties);

  /**
   * Creates a single property.
   * @param {string} propertyName - The name of the property to create
   * @returns {Promise<Object>} Promise that resolves with property creation result
   */
  async function createSingleProperty(propertyName) {
    let property = equipmentData.parent.getProperties().find((a) => a.name === propertyName);
    if (property) {
      await property.system.wikiPull({ notify: false });
    } else {
      await createProperty(equipmentData.parent, propertyName, { notify: false });
    }
    return {
      propertyName: propertyName,
      success: true,
    };
  }

  const propertyPromises = toCreate.map((propertyName) => createSingleProperty(propertyName));
  try {
    await Promise.all(propertyPromises);
    // Optional property deletion.
    // const toDelete = equipmentData.parent.getProperties().filter((p) => !toCreate.includes(p.name)).map((p) => p.id);
    // await equipmentData.parent.deleteEmbeddedDocuments("ActiveEffect", toDelete);
  } catch (error) {
    progress.update({
      pct: 0.9,
      message: `Error occurred during property creation: ${error.message}`,
    });
    console.error("Error creating properties:", error);
    throw error;
  }

  parameters.properties = [];

  parameters.editable = false;

  _override(equipmentData, parameters);


  const oldImg = equipmentData.parent.img;
  let newImg = oldImg;
  if (oldImg?.startsWith("systems/teriock/assets")
    || oldImg?.startsWith("systems/teriock/src/icons/documents")
    || oldImg?.startsWith("systems/teriock/src/icons/equipment")
    || oldImg?.startsWith("icons/svg")) {
    newImg = getIcon("equipment", equipmentData.equipmentType);
    newImg = newImg.replace("ō", "o");
  }

  // Remove unused parameters
  [
    "equipmentType",
    "powerLevel",
    "disabled",
    "description",
    "flaws",
    "tier",
    "effectiveTier",
    "notes",
    "shattered",
    "dampened",
    "materialProperties",
    "disabled",
    "glued",
    "font",
    "equipped",
  ].forEach((key) => delete parameters[key]);

  return {
    system: parameters,
    img: newImg,
  };
}
