import { traits } from "../../../../constants/generated/traits.mjs";
import { getBarText, getText } from "../../../shared/parsing/get-text.mjs";
import { processSubAbilities } from "../../../shared/parsing/process-subs.mjs";
import { buildTagTree } from "../../../shared/parsing/tag-tree.mjs";

/**
 *
 * @param {TeriockSpeciesData} speciesData
 * @param {string} rawHTML
 * @returns {Promise<object>}
 * @private
 */
export async function _parse(speciesData, rawHTML) {
  // Remove existing abilities
  const toDelete = speciesData.parent.abilities.map((a) => a.id);
  await speciesData.parent.deleteEmbeddedDocuments("ActiveEffect", toDelete);

  const doc = new DOMParser().parseFromString(rawHTML, "text/html");
  doc
    .querySelectorAll(".ability-bar-familiar-abilities")
    .forEach((el) => el.remove());

  const subs = Array.from(doc.querySelectorAll(".expandable-container")).filter(
    (el) => !el.closest(".expandable-container:not(:scope)"),
  );

  doc.querySelectorAll(".ability-sub-container").forEach((el) => el.remove());
  doc.querySelectorAll(".expandable-container").forEach((el) => el.remove());
  doc.querySelectorAll(".dice").forEach((el) => {
    const fullRoll = el.getAttribute("data-full-roll");
    const quickRoll = el.getAttribute("data-quick-roll");
    if (quickRoll) el.textContent = `[[/roll ${fullRoll}]]`;
  });

  const tagTree = buildTagTree(doc);
  await speciesData.setDiceFormula("hp", tagTree["hp-dice"][0]);
  await speciesData.setDiceFormula("mp", tagTree["mp-dice"][0]);
  const parameters = {
    lifespan: null,
    adult: null,
  };
  if (tagTree["traits"]) parameters.traits = tagTree["traits"];
  parameters.traits = parameters.traits.filter((t) =>
    Object.keys(traits).includes(t),
  );
  parameters.appearance = getBarText(doc, "looks");
  parameters.description = getText(doc, "creature-description");
  parameters.size = {
    value: Number(tagTree["size"][0].split("size")[1]),
  };
  const lifespanText = getBarText(doc, "lifespan");
  if (lifespanText) {
    parameters.adult = Number(
      lifespanText.split("Adult at age ")[1].split(".")[0],
    );
    if (!lifespanText.includes("Infinite")) {
      parameters.lifespan = Number(lifespanText.split(" years")[0]);
    }
  }
  await processSubAbilities(subs, speciesData);
  return { system: parameters };
}
