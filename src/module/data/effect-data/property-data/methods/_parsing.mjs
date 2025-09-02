import { toKebabCase } from "../../../../helpers/utils.mjs";
import { extractChangesFromHTML } from "../../../shared/parsing/extract-changes.mjs";
import { processSubProperties } from "../../../shared/parsing/process-subs.mjs";
import { getCategoriesFromHTML } from "../../../shared/parsing/get-categories.mjs";
import { cleanHTMLDoc } from "../../../shared/parsing/clean-html-doc.mjs";

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

  // Clean up old subs
  await propertyData.parent.deleteSubs();

  // Get new subs
  const subs = Array.from(
    doc.querySelectorAll(".ability-sub-container"),
  ).filter((el) => !el.closest(".ability-sub-container:not(:scope)"));

  // Remove sub-containers and process dice
  cleanHTMLDoc(doc);

  rawHTML = doc.querySelector("body").innerHTML;

  doc.querySelectorAll(".ability-sub-container").forEach((el) => el.remove());

  const name = propertyData.parent.name;
  const categories = getCategoriesFromHTML(rawHTML);


  const referenceProperty = new ActiveEffect({
    name: "Reference Property",
    type: "property",
  });
  const parameters = {
    /** @type {TeriockPropertyData} */
    system: foundry.utils.deepClone(referenceProperty.system).toObject(),
  };
  // Clean parameters
  delete parameters.system.hierarchy.rootUuid;
  delete parameters.system.hierarchy.supId;
  delete parameters.system.hierarchy.subIds;

  console.log(categories);

  await processSubProperties(subs, propertyData.parent);

  parameters.system.damageType = extractDamageType(doc);
  parameters.system.form = "intrinsic";
  if (categories.has("Magical properties")) {
    parameters.system.form = "normal";
  }
  if (categories.has("Special properties")) {
    parameters.system.form = "special";
  }
  if (categories.has("Flaw properties")) {
    parameters.system.form = "flaw";
  }
  if (categories.has("Material properties")) {
    parameters.system.damageType = name;
  }

  parameters.description = doc.querySelector("body").innerHTML;
  parameters.system.changes = extractChangesFromHTML(rawHTML);
  parameters.system.modifiesActor = extractDocument(doc);
  parameters.system.description = parameters.description;
  parameters.img = `systems/teriock/src/icons/properties/${toKebabCase(name)}.webp`;
  return parameters;
}

/**
 * @param {Document} doc
 * @returns {boolean} True if the target document is `Actor`.
 */
function extractDocument(doc) {
  const documentMetadata = /** @type {HTMLSpanElement|undefined} */ doc.querySelector("span.metadata[data-type='document']");
  if (documentMetadata) {
    const targetDocument = documentMetadata.dataset.document;
    if (targetDocument === "actor") return true;
  }
  return false;
}

/**
 * @param {Document} doc
 * @returns {string} Damage type.
 */
function extractDamageType(doc) {
  const documentMetadata = /** @type {HTMLSpanElement|undefined} */ doc.querySelector("span.metadata[data-type='damage-type']");
  if (documentMetadata) {
    return documentMetadata.dataset.value || "";
  }
  return "";
}