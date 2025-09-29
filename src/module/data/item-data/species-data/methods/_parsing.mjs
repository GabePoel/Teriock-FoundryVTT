import { TeriockRoll } from "../../../../dice/_module.mjs";
import { getIcon } from "../../../../helpers/path.mjs";
import { cleanHTMLDoc, cleanObject } from "../../../shared/parsing/clean-html-doc.mjs";
import { getBarText, getText } from "../../../shared/parsing/get-text.mjs";
import { processSubAbilities } from "../../../shared/parsing/process-subs.mjs";
import { buildTagTree } from "../../../shared/parsing/tag-tree.mjs";

/**
 * @param {TeriockSpeciesModel} speciesData
 * @param {string} rawHTML
 * @returns {Promise<object>}
 * @private
 */
export async function _parse(speciesData, rawHTML) {
  // Remove existing abilities
  // const toDelete = speciesData.parent.abilities.map((a) => a.id);
  // await speciesData.parent.deleteEmbeddedDocuments("ActiveEffect", toDelete);

  const doc = new DOMParser().parseFromString(rawHTML, "text/html");
  doc
    .querySelectorAll(".ability-bar-familiar-abilities")
    .forEach((el) => el.remove());

  const subs = Array.from(doc.querySelectorAll(".expandable-container")).filter(
    (el) => !el.closest(".expandable-container:not(:scope)"),
  );
  await processSubAbilities(subs, speciesData.parent);

  // Remove sub-containers and process dice
  cleanHTMLDoc(doc);

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
  if (hpDiceFormula === "x") {
    parameters.applyHp = false;
  } else {
    const hpRoll = new TeriockRoll(hpDiceFormula, {});
    if (hpRoll.dice.length > 0) {
      const number = hpRoll.dice[0].number;
      const faces = hpRoll.dice[0].faces;
      parameters.hpDiceBase = {
        number: number,
        faces: faces,
      };
    }
    await speciesData.setDice(
      "hp",
      parameters.hpDiceBase.number,
      parameters.hpDiceBase.faces,
    );
  }
  if (mpDiceFormula === "x") {
    parameters.applyMp = false;
  } else {
    const mpRoll = new TeriockRoll(mpDiceFormula, {});
    if (mpRoll.dice.length > 0) {
      const number = mpRoll.dice[0].number;
      const faces = mpRoll.dice[0].faces;
      parameters.mpDiceBase = {
        number: number,
        faces: faces,
      };
    }
    await speciesData.setDice(
      "mp",
      parameters.mpDiceBase.number,
      parameters.mpDiceBase.faces,
    );
  }
  if (tagTree["traits"]) {
    parameters.traits = tagTree["traits"];
  }
  parameters.traits = parameters.traits.filter((t) =>
    Object.keys(TERIOCK.index.traits).includes(t),
  );
  parameters.appearance = getBarText(doc, "looks");
  parameters.description = getText(doc, "creature-description");
  parameters.hpIncrease = getBarText(doc, "hp-increase");
  parameters.attributeIncrease = getBarText(doc, "attribute-increase");
  parameters.innateRanks = getBarText(doc, "innate-ranks");
  const sizeString = tagTree["size"][0].split("size")[1];
  if (tagTree["size"][0] === "x") {
    parameters.size = {
      enabled: false,
    };
  } else {
    if (sizeString.includes("-")) {
      const sizeParts = sizeString.split("-");
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
  if (sizeStepHpText) {
    parameters.sizeStepHp = Number(
      sizeStepHpText.split("every ")[1].split(" additional")[0],
    );
  } else {
    parameters.sizeStepHp = null;
  }
  const sizeStepMpText = getBarText(doc, "mp-increase");
  if (sizeStepMpText) {
    parameters.sizeStepMpText = Number(
      sizeStepMpText.split("every ")[1].split(" additional")[0],
    );
  } else {
    parameters.sizeStepMp = null;
  }
  cleanObject(parameters, [
    "appearance",
    "attributeIncrease",
    "description",
    "hpIncrease",
    "innateRanks",
  ]);
  let icon = getIcon("creatures", speciesData.parent.name);
  const outData = {
    system: parameters,
  };
  if (icon) {
    outData.img = icon;
  }
  return outData;
}
