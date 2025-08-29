import { traits } from "../../../../constants/generated/traits.mjs";
import { TeriockRoll } from "../../../../documents/_module.mjs";
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

  const parameters = {
    lifespan: null,
    adult: null,
    sizeStepAbilities: {},
  };

  doc
    .querySelectorAll("span.metadata[data-type='size-attribute-increase']")
    .forEach(
      /** @param {HTMLSpanElement} el */ (el) => {
        const gainAbilities = new Set([el.dataset.gain]);
        const loseAbilities = new Set([el.dataset.lose]);
        const size = Number(el.dataset.size);
        parameters.sizeStepAbilities[size] = {
          gain: gainAbilities,
          lose: loseAbilities,
        };
      },
    );

  const tagTree = buildTagTree(doc);
  console.log(tagTree);
  const hpDiceFormula = tagTree["hp-dice"][0];
  const mpDiceFormula = tagTree["mp-dice"][0];
  const hpRoll = new TeriockRoll(hpDiceFormula, {});
  const mpRoll = new TeriockRoll(mpDiceFormula, {});
  if (hpRoll.dice.length > 0) {
    const number = hpRoll.dice[0].number;
    const faces = hpRoll.dice[0].faces;
    parameters.hpDiceBase = {
      number: number,
      faces: faces,
    };
  }
  if (mpRoll.dice.length > 0) {
    const number = mpRoll.dice[0].number;
    const faces = mpRoll.dice[0].faces;
    parameters.mpDiceBase = {
      number: number,
      faces: faces,
    };
  }
  if (tagTree["traits"]) parameters.traits = tagTree["traits"];
  parameters.traits = parameters.traits.filter((t) =>
    Object.keys(traits).includes(t),
  );
  parameters.appearance = getBarText(doc, "looks");
  parameters.description = getText(doc, "creature-description");
  parameters.hpIncrease = getBarText(doc, "hp-increase");
  parameters.attributeIncrease = getBarText(doc, "attribute-increase");
  parameters.innateRanks = getBarText(doc, "innate-ranks");
  const sizeString = tagTree["size"][0].split("size")[1];
  if (sizeString.includes("-")) {
    const sizeParts = sizeString.split("-");
    console.log(sizeParts);
    parameters.size = {
      min: Number(sizeParts[0]),
      value: Number(sizeParts[0]),
      max: Number(sizeParts[1]),
    };
  } else if (sizeString.includes("+")) {
    const sizeNumber = Number(sizeString.split("+")[0]);
    parameters.size = {
      min: sizeNumber,
      value: sizeNumber,
      max: null,
    };
  } else {
    parameters.size = {
      min: null,
      value: Number(sizeString),
      max: null,
    };
  }
  parameters.br = Number(tagTree["br"][0].split("br")[1]);
  const lifespanText = getBarText(doc, "lifespan");
  if (lifespanText) {
    parameters.adult = Number(
      lifespanText.split("Adult at age ")[1].split(".")[0],
    );
    if (!lifespanText.includes("Infinite")) {
      parameters.lifespan = Number(lifespanText.split(" years")[0]);
    }
  }
  const sizeStepHpText = getBarText(doc, "hp-increase");
  console.log(sizeStepHpText);
  if (sizeStepHpText) {
    parameters.sizeStepHp = Number(
      sizeStepHpText.split("every ")[1].split(" additional")[0],
    );
  } else parameters.sizeStepHp = null;
  const sizeStepMpText = getBarText(doc, "mp-increase");
  if (sizeStepMpText) {
    parameters.sizeStepMpText = Number(
      sizeStepMpText.split("every ")[1].split(" additional")[0],
    );
  } else parameters.sizeStepMp = null;
  await processSubAbilities(subs, speciesData);
  return { system: parameters };
}
