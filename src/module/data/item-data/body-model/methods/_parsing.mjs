import { cleanValue } from "../../../../helpers/clean.mjs";
import { createProperty } from "../../../../helpers/create-effects.mjs";
import { getImage } from "../../../../helpers/path.mjs";
import { toCamelCase, toInt } from "../../../../helpers/string.mjs";

/**
 * @param {TeriockBodyModel} bodyData
 * @param {string} rawHTML
 * @returns {Promise<object>}
 * @private
 */
export async function _parse(bodyData, rawHTML) {
  const allValidProperties = foundry.utils.deepClone(TERIOCK.index.properties);
  const doc = new DOMParser().parseFromString(rawHTML, "text/html");
  const q = (s) => doc.querySelector(s);
  const getValue = (s) => q(s)?.getAttribute("data-val");
  const getText = (s) => q(s)?.textContent.trim();
  const getTextAll = (s) =>
    Array.from(doc.querySelectorAll(s), (el) => el.textContent.trim());

  const referenceBody = new foundry.documents.Item.implementation({
    name: "Reference Body",
    type: "body",
  });
  /** @type {Partial<TeriockBodyModel>} */
  const parameters = foundry.utils.deepClone(referenceBody.system).toObject();
  delete parameters.fluent;
  delete parameters.proficient;
  delete parameters.flaws;
  delete parameters.notes;
  delete parameters.description;

  // Parse damage
  let damageText = getText(".damage");
  console.log(damageText);
  parameters.damage = {
    base: {},
  };
  if (damageText) {
    if (damageText.includes(" ")) {
      damageText = damageText.split(" ")[0];
    }
    const match = damageText.match(/^([^(]+)\s*\(([^)]+)\)/);
    parameters.damage.base.saved = match ? match[1].trim() : damageText;
  }

  //  Parse arrays
  let properties = new Set(getTextAll(".property"));

  // Add piercing property if present
  const piercing = getValue(".piercing");
  if (piercing) {
    properties.add(piercing.toUpperCase());
  }

  // Parse sb, av, bv
  parameters.fightingStyle =
    toCamelCase(getValue(".sb") || "") ?? parameters.fightingStyle;
  parameters.av = { saved: toInt(cleanValue(getValue(".av"))) || 0 };
  parameters.bv = { saved: toInt(cleanValue(getValue(".bv"))) || 0 };

  const toCreate = Array.from(properties);
  const filteredProperties = toCreate.filter((p) =>
    Object.values(allValidProperties).includes(p),
  );
  toCreate.length = 0;
  toCreate.push(...filteredProperties);

  /**
   * Creates a single property.
   * @param {string} propertyName - The name of the property to create
   * @returns {Promise<Object>} Promise that resolves with property creation result
   */
  async function createSingleProperty(propertyName) {
    let property = bodyData.parent
      .getProperties()
      .find((a) => a.name === propertyName);
    if (property) {
      await property.system.wikiPull({ notify: false });
    } else {
      await createProperty(bodyData.parent, propertyName, {
        notify: false,
      });
    }
    return {
      propertyName: propertyName,
      success: true,
    };
  }

  const propertyPromises = toCreate.map((propertyName) =>
    createSingleProperty(propertyName),
  );
  try {
    await Promise.all(propertyPromises);
    // Optional property deletion.
    // const toDelete = equipmentData.parent.getProperties().filter((p) => !toCreate.includes(p.name)).map((p) => p.id);
    // await equipmentData.parent.deleteEmbeddedDocuments("ActiveEffect", toDelete);
  } catch (error) {
    foundry.ui.notifications.error(`Error creating properties: ${error}`);
    throw error;
  }

  const oldImg = bodyData.parent.img;
  const newImg = getImage("body-parts", bodyData.parent.name) || oldImg;

  return {
    system: parameters,
    img: newImg,
  };
}
