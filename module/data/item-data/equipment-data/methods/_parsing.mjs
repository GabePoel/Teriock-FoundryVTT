import { cleanValue } from "../../../../helpers/clean.mjs";
import { createProperty } from "../../../../helpers/create-effects.mjs";
import { toCamelCase, toCamelCaseList } from "../../../../helpers/utils.mjs";
import { _override } from "./_overrides.mjs";

/**
 * Parses raw HTML content for equipment, extracting properties and creating effects.
 * Handles damage parsing, numeric values, arrays, and property creation.
 *
 * @param {TeriockEquipmentData} equipmentData - The equipment data to parse content for.
 * @param {string} rawHTML - The raw HTML content to parse.
 * @returns {Promise<{ changes: object[], system: Partial<TeriockEquipmentData>, img: string }>} Promise that resolves
 *   to the parsed equipment data.
 * @private
 */
export async function _parse(equipmentData, rawHTML) {
  const validProperties = Object.values(CONFIG.TERIOCK.equipmentOptions.properties);
  const validMaterialProperties = Object.values(CONFIG.TERIOCK.equipmentOptions.materialProperties);
  const validMagicalProperties = Object.values(CONFIG.TERIOCK.equipmentOptions.magicalProperties);
  const allValidProperties = [...validProperties, ...validMaterialProperties, ...validMagicalProperties, "Weapon"];

  // Remove existing properties
  const toRemove = [];
  for (const effect of equipmentData.parent.transferredEffects.filter((e) => e.type === "property")) {
    if (allValidProperties.includes(effect.name)) {
      toRemove.push(effect._id);
    }
  }
  await equipmentData.parent.deleteEmbeddedDocuments("ActiveEffect", toRemove);
  const doc = new DOMParser().parseFromString(rawHTML, "text/html");
  const q = (s) => doc.querySelector(s);
  const getValue = (s) => q(s)?.getAttribute("data-val");
  const getText = (s) => q(s)?.textContent.trim();
  const getTextAll = (s) => Array.from(doc.querySelectorAll(s), (el) => el.textContent.trim());
  const getHTML = (s) => q(s)?.innerHTML.trim();

  const referenceEquipment = new Item({ name: "Reference Equipment", type: "equipment" });
  const parameters = foundry.utils.deepClone(referenceEquipment.system).toObject();

  // Parse damage
  const damageText = getText(".damage");
  if (damageText) {
    const match = damageText.match(/^([^(]+)\s*\(([^)]+)\)/);
    parameters.damage = match ? match[1].trim() : damageText;
    if (match) parameters.twoHandedDamage = match[2].trim();
  }

  // Parse numeric and range values
  parameters.weight = cleanValue(getValue(".weight")) ?? parameters.weight;
  parameters.shortRange = cleanValue(getText(".short-range")) ?? parameters.shortRange;
  parameters.range = cleanValue(getText(".normal-range")) ?? parameters.range;
  parameters.range = cleanValue(getText(".long-range")) ?? parameters.range;
  parameters.minStr = cleanValue(getValue(".min-str")) ?? parameters.minStr;

  // Parse arrays
  parameters.equipmentClasses = getTextAll(".equipment-class");
  parameters.properties = getTextAll(".property");

  // Add piercing property if present
  const piercing = getValue(".piercing");
  if (piercing) parameters.properties.push(piercing);

  // Parse sb, av, bv
  parameters.sb = toCamelCase(getValue(".sb") || "") ?? parameters.sb;
  parameters.av = cleanValue(getValue(".av")) || 0;
  parameters.bv = cleanValue(getValue(".bv")) || 0;

  // Special rules
  parameters.specialRules = getHTML(".special-rules") ?? parameters.specialRules;

  // Sort and filter properties/classes
  // parameters.properties = parameters.properties.filter(Boolean).sort((a, b) => a.localeCompare(b));
  parameters.equipmentClasses = parameters.equipmentClasses.filter(Boolean).sort((a, b) => a.localeCompare(b));
  parameters.equipmentClasses = toCamelCaseList(parameters.equipmentClasses);
  const candidateProperties = toCamelCaseList(parameters.properties);

  // Filter properties by config
  const allowedProperties = [
    ...Object.keys(CONFIG.TERIOCK.equipmentOptions.properties),
    ...Object.keys(CONFIG.TERIOCK.equipmentOptions.materialProperties),
    ...Object.keys(CONFIG.TERIOCK.equipmentOptions.magicalProperties),
  ];
  const filteredProperties = candidateProperties.filter((p) => allowedProperties.includes(p));
  candidateProperties.length = 0;
  candidateProperties.push(...filteredProperties);

  for (const key of candidateProperties) {
    await createProperty(equipmentData.parent, key);
  }

  parameters.properties = [];

  parameters.editable = false;

  _override(equipmentData, parameters);

  const oldImg = equipmentData.parent.img;
  let newImg = oldImg;
  if (oldImg?.startsWith("systems/teriock/assets") || oldImg?.startsWith("icons/svg")) {
    newImg = "systems/teriock/assets/searchable.svg";
    newImg = `systems/teriock/assets/equipment/${equipmentData.equipmentType?.toLowerCase().replace(/\s+/g, "-")}.svg`;
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

  console.log(parameters);

  return { system: parameters, img: newImg };
}
