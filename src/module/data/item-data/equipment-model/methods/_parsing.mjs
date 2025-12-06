import { cleanValue } from "../../../../helpers/clean.mjs";
import { getImage } from "../../../../helpers/path.mjs";
import { toCamelCase, toInt } from "../../../../helpers/string.mjs";
import { ensureChildren } from "../../../../helpers/utils.mjs";
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
  const getTextAll = (s) =>
    Array.from(doc.querySelectorAll(s), (el) => el.textContent.trim());

  const referenceEquipment = new foundry.documents.Item.implementation({
    name: "Reference Equipment",
    type: "equipment",
  });
  /** @type {Partial<TeriockEquipmentModel>} */
  const parameters = foundry.utils
    .deepClone(referenceEquipment.system)
    .toObject();
  delete parameters.proficient;
  delete parameters.fluent;
  delete parameters.flaws;
  delete parameters.consumable;
  delete parameters.notes;
  delete parameters.description;
  delete parameters.powerLevel;
  delete parameters.quantity;
  delete parameters.maxQuantity;
  delete parameters.onUse;
  delete parameters.storage;

  // Parse damage
  const damageText = getText(".damage");
  parameters.damage = {
    base: {},
    twoHanded: {},
  };
  if (damageText) {
    const match = damageText.match(/^([^(]+)\s*\(([^)]+)\)/);
    parameters.damage.base.raw = match ? match[1].trim() : damageText;
    if (match) {
      parameters.damage.twoHanded.raw = match[2].trim();
    }
  }

  // Parse numeric and range values
  parameters.range = {
    long: {},
    short: {},
    ranged: false,
  };
  parameters.weight = { raw: cleanValue(getValue(".weight")) };
  parameters.range.short = { raw: cleanValue(getText(".short-range")) };
  parameters.range.long = { raw: cleanValue(getText(".normal-range")) };
  parameters.range.long = { raw: cleanValue(getText(".long-range")) };
  parameters.minStr = { raw: cleanValue(getValue(".min-str")) };
  const consumableElement = doc.querySelector(
    ".metadata[data-type='consumable']",
  );
  if (consumableElement) {
    parameters.consumable = true;
  }

  // Parse arrays
  let equipmentClasses = new Set(getTextAll(".equipment-class"));
  let properties = new Set(getTextAll(".property"));
  let abilitiesToCreate = new Set(getTextAll(".ability"));

  // Add piercing property if present
  const piercing = getValue(".piercing");
  if (piercing === "ub") {
    properties.add("Unblockable");
  } else if (piercing === "ap") {
    properties.add("Armor Piercing");
  } else if (piercing === "av0") {
    properties.add("AV0");
  }

  // Add attack penalty property if present
  const attackPenalty = getValue(".attack-penalty");
  console.log(attackPenalty);
  if (attackPenalty) {
    parameters.attackPenalty = {
      raw: attackPenalty,
    };
  }

  // Add ranged properties if present
  const reach = Boolean(getText("a[title='Property:Reach']"));
  const thrown = Boolean(getText("a[title='Property:Thrown']"));
  const ammunition = Boolean(getText("a[title='Property:Ammunition']"));
  if (reach) {
    properties.add("Reach");
  }
  if (thrown) {
    properties.add("Thrown");
  }
  if (ammunition) {
    properties.add("Ammunition");
  }

  // Parse sb, av, bv
  parameters.fightingStyle =
    toCamelCase(getValue(".sb") || "") ?? parameters.fightingStyle;
  parameters.av = { raw: toInt(cleanValue(getValue(".av"))) || 0 };
  parameters.bv = { raw: toInt(cleanValue(getValue(".bv"))) || 0 };

  // Sort and filter properties and equipment classes
  parameters.equipmentClasses = new Set(
    Array.from(equipmentClasses).map((s) => toCamelCase(s)),
  );
  const propertiesToCreate = Array.from(properties);
  const filteredProperties = propertiesToCreate.filter((p) =>
    Object.values(allValidProperties).includes(p),
  );
  propertiesToCreate.length = 0;
  propertiesToCreate.push(...filteredProperties);

  await ensureChildren(equipmentData.parent, "property", propertiesToCreate);
  await ensureChildren(equipmentData.parent, "ability", abilitiesToCreate);

  const abilityUpdates = equipmentData.parent.abilities
    .filter((a) => abilitiesToCreate.has(a.name))
    .map((a) => {
      return {
        _id: a._id,
        "system.form": "intrinsic",
      };
    });
  if (abilityUpdates.length > 0) {
    await equipmentData.parent.updateChildDocuments(
      "ActiveEffect",
      abilityUpdates,
    );
  }

  parameters.properties = [];

  parameters.editable = false;

  _override(equipmentData, parameters);

  const oldImg = equipmentData.parent.img;
  let newImg = oldImg;
  if (
    oldImg?.startsWith("systems/teriock/assets") ||
    oldImg?.startsWith("systems/teriock/src/icons/documents") ||
    oldImg?.startsWith("systems/teriock/src/icons/equipment") ||
    oldImg?.startsWith("icons/svg")
  ) {
    newImg = getImage("equipment", equipmentData.equipmentType);
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
