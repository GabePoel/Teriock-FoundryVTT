import { cleanValue } from "../../../../helpers/clean.mjs";
import { createProperty } from "../../../../helpers/create-effects.mjs";
import { toCamelCase, toKebabCase } from "../../../../helpers/utils.mjs";
import { _override } from "./_overrides.mjs";

/**
 * Parses raw HTML content for equipment, extracting properties and creating effects.
 * Handles damage parsing, numeric values, arrays, and property creation.
 *
 * @param {TeriockEquipmentData} equipmentData - The equipment data to parse content for.
 * @param {string} rawHTML - The raw HTML content to parse.
 * @returns {Promise<{ system: Partial<TeriockEquipmentData>, img: string }>} Promise that resolves
 *   to the parsed equipment data.
 * @private
 */
export async function _parse(equipmentData, rawHTML) {
  const allValidProperties = foundry.utils.deepClone(CONFIG.TERIOCK.properties);
  allValidProperties["weapon"] = "Weapon";

  // Remove existing properties
  const toRemove = [];
  for (const effect of equipmentData.parent.transferredEffects.filter(
    (e) => e.type === "property",
  )) {
    if (Object.values(allValidProperties).includes(effect.name)) {
      toRemove.push(effect._id);
    }
  }
  await equipmentData.parent.deleteEmbeddedDocuments("ActiveEffect", toRemove);
  const doc = new DOMParser().parseFromString(rawHTML, "text/html");
  const q = (s) => doc.querySelector(s);
  const getValue = (s) => q(s)?.getAttribute("data-val");
  const getText = (s) => q(s)?.textContent.trim();
  const getTextAll = (s) =>
    Array.from(doc.querySelectorAll(s), (el) => el.textContent.trim());
  const getHTML = (s) => q(s)?.innerHTML.trim();

  const referenceEquipment = new Item({
    name: "Reference Equipment",
    type: "equipment",
  });
  /** @type {Partial<TeriockEquipmentData>} */
  const parameters = foundry.utils
    .deepClone(referenceEquipment.system)
    .toObject();

  // Parse damage
  const damageText = getText(".damage");
  if (damageText) {
    const match = damageText.match(/^([^(]+)\s*\(([^)]+)\)/);
    parameters.damage = match ? match[1].trim() : damageText;
    if (match) parameters.twoHandedDamage = match[2].trim();
  }

  // Parse numeric and range values
  parameters.weight = cleanValue(getValue(".weight")) ?? parameters.weight;
  parameters.shortRange =
    cleanValue(getText(".short-range")) ?? parameters.shortRange;
  parameters.range = cleanValue(getText(".normal-range")) ?? parameters.range;
  parameters.range = cleanValue(getText(".long-range")) ?? parameters.range;
  parameters.minStr = cleanValue(getValue(".min-str")) ?? parameters.minStr;

  // Parse arrays
  let equipmentClasses = new Set(getTextAll(".equipment-class"));
  let properties = new Set(getTextAll(".property"));

  // Add piercing property if present
  const piercing = getValue(".piercing");
  if (piercing) properties.add(piercing);

  // Parse sb, av, bv
  parameters.sb = toCamelCase(getValue(".sb") || "") ?? parameters.sb;
  parameters.av = cleanValue(getValue(".av")) || 0;
  parameters.bv = cleanValue(getValue(".bv")) || 0;

  // Special rules
  parameters.specialRules =
    getHTML(".special-rules") ?? parameters.specialRules;

  // Sort and filter properties and equipment classes
  parameters.equipmentClasses = new Set(
    Array.from(equipmentClasses).map((s) => toCamelCase(s)),
  );
  const candidateProperties = Array.from(properties);
  const filteredProperties = candidateProperties.filter((p) =>
    Object.values(allValidProperties).includes(p),
  );
  candidateProperties.length = 0;
  candidateProperties.push(...filteredProperties);

  for (const name of candidateProperties) {
    await createProperty(equipmentData.parent, name);
  }

  parameters.properties = [];

  parameters.editable = false;

  _override(equipmentData, parameters);

  const oldImg = equipmentData.parent.img;
  let newImg = oldImg;
  if (
    oldImg?.startsWith("systems/teriock/assets") ||
    oldImg?.startsWith("systems/teriock/src/icons/equipment") ||
    oldImg?.startsWith("icons/svg")
  ) {
    newImg = `systems/teriock/src/icons/equipment/${toKebabCase(equipmentData.equipmentType)}.webp`;
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
  ].forEach((key) => delete parameters[key]);

  return { system: parameters, img: newImg };
}
