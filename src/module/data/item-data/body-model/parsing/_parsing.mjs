import { cleanValue } from "../../../../helpers/clean.mjs";
import { getImage } from "../../../../helpers/path.mjs";
import { ensureChildren } from "../../../../helpers/resolve.mjs";
import { toCamelCase, toInt } from "../../../../helpers/string.mjs";

/**
 * @param {TeriockBodyModel} bodyData
 * @param {string} rawHTML
 * @returns {Promise<object>}
 * @private
 */
export async function _parse(bodyData, rawHTML) {
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
    parameters.damage.base.raw = match ? match[1].trim() : damageText;
  }

  //  Parse arrays
  let properties = new Set(getTextAll(".property"));

  // Add piercing property if present
  const piercing = getValue(".piercing");
  if (piercing && piercing !== "normal") {
    properties.add(
      piercing
        .toUpperCase()
        .replace("UB", "Unblockable")
        .replace("AP", "Armor Piercing"),
    );
  }

  // Parse sb, av, bv
  parameters.fightingStyle =
    toCamelCase(getValue(".sb") || "") ?? parameters.fightingStyle;
  parameters.av = { raw: toInt(cleanValue(getValue(".av"))) || 0 };
  parameters.bv = { raw: toInt(cleanValue(getValue(".bv"))) || 0 };

  const toCreate = Array.from(properties);
  await ensureChildren(bodyData.parent, "property", toCreate || []);

  const oldImg = bodyData.parent.img;
  const newImg = getImage("body-parts", bodyData.parent.name) || oldImg;

  return {
    system: parameters,
    img: newImg,
  };
}
