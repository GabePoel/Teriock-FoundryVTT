import { TeriockRoll } from "../../../../dice/_module.mjs";
import { getIcon } from "../../../../helpers/path.mjs";
import { toCamelCase } from "../../../../helpers/string.mjs";
import {
  cleanHTMLDoc,
  cleanObject,
} from "../../../shared/parsing/clean-html-doc.mjs";
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
  const doc = new DOMParser().parseFromString(rawHTML, "text/html");
  doc
    .querySelectorAll(".ability-bar-familiar-abilities")
    .forEach((el) => el.remove());

  const importedBodyPartNames = [];
  const importedEquipmentNames = [];

  doc
    .querySelectorAll(".expandable-container[data-namespace='Body']")
    .forEach(
      /** @param {HTMLDivElement} e */ (e) =>
        importedBodyPartNames.push(e.dataset.name),
    );

  doc
    .querySelectorAll(".expandable-container[data-namespace='Equipment']")
    .forEach(
      /** @param {HTMLDivElement} e */ (e) =>
        importedEquipmentNames.push(e.dataset.name),
    );

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

  const bodyPartsPack = game.teriock.packs.bodyParts();
  const equipmentPack = game.teriock.packs.equipment();
  const importedBodyPartUUIDs = importedBodyPartNames
    .map((n) => bodyPartsPack.index.getName(n)?.uuid)
    .filter((b) => b);
  const importedEquipmentUUIDs = importedEquipmentNames
    .map((n) => equipmentPack.index.getName(n)?.uuid)
    .filter((e) => e);
  parameters.imports = {
    ranks: {
      classes: {},
      archetypes: {},
      general: 0,
    },
    items: [...importedBodyPartUUIDs, ...importedEquipmentUUIDs],
  };
  doc.querySelectorAll("span.metadata[data-type='import']").forEach(
    /** @param {HTMLSpanElement} el */ (el) => {
      const parameterKey = el.dataset.key;
      const number = Number(el.dataset.number);
      if (parameterKey !== "ranks.general") {
        const nameKey = toCamelCase(el.dataset.name);
        const key = parameterKey + "." + nameKey;
        foundry.utils.setProperty(parameters.imports, key, number);
      } else {
        parameters.imports.ranks.general = number;
      }
    },
  );

  const tagTree = buildTagTree(doc);
  console.log(tagTree);
  const hpDiceFormula = tagTree["hp-dice"][0];
  const mpDiceFormula = tagTree["mp-dice"][0];
  parameters.statDice = {
    hp: {
      "number.saved": "1",
      faces: 10,
      disabled: false,
    },
    mp: {
      "number.saved": "1",
      faces: 10,
      disabled: false,
    },
  };
  if (hpDiceFormula === "x") {
    parameters.statDice.hp.disabled = true;
  } else {
    const hpRoll = new TeriockRoll(hpDiceFormula, {});
    if (hpRoll.dice.length > 0) {
      const number = hpRoll.dice[0].number;
      const faces = hpRoll.dice[0].faces;
      parameters.statDice.hp["number.saved"] = number.toString();
      parameters.statDice.hp.faces = faces;
    }
  }
  if (mpDiceFormula === "x") {
    parameters.statDice.mp.disabled = true;
  } else {
    const mpRoll = new TeriockRoll(mpDiceFormula, {});
    if (mpRoll.dice.length > 0) {
      const number = mpRoll.dice[0].number;
      const faces = mpRoll.dice[0].faces;
      parameters.statDice.mp["number.saved"] = number.toString();
      parameters.statDice.mp.faces = faces;
    }
  }
  if (tagTree["traits"]) {
    parameters.traits = tagTree["traits"].map((t) => toCamelCase(t));
  }
  parameters.traits = parameters.traits.filter((t) =>
    Object.keys(TERIOCK.index.traits).includes(t),
  );
  parameters.appearance = getBarText(doc, "looks");
  parameters.description = getText(doc, "creature-description");
  parameters.hpIncrease = getBarText(doc, "hp-increase");
  parameters.mpIncrease = getBarText(doc, "mp-increase");
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
    let diceStep = 0;
    if (sizeStepHpText.includes("dice")) {
      diceStep = Number(
        sizeStepHpText.split("another")[1].split("hit")[0].trim(),
      );
    } else if (sizeStepHpText.includes("die")) {
      diceStep = 1;
    }
    const sizeStep = Number(
      sizeStepHpText.split("every ")[1].split(" additional")[0],
    );
    let hpDieNumberFormula = parameters.statDice.hp["number.saved"];
    let baseHpDieNumber = Number(hpDieNumberFormula);
    baseHpDieNumber -= diceStep * (parameters.size.value / sizeStep);
    hpDieNumberFormula = `${diceStep > 1 ? `${diceStep} * ` : ""}${
      sizeStep > 1 ? `(@size) / ${sizeStep})` : `@size`
    }${baseHpDieNumber !== 0 ? ` ${baseHpDieNumber < 0 ? "-" : "+"} ${Math.abs(baseHpDieNumber)}` : ""}`;
    parameters.statDice.hp["number.saved"] = hpDieNumberFormula;
  }
  const sizeStepMpText = getBarText(doc, "mp-increase");
  if (sizeStepMpText) {
    let diceStep = 0;
    if (sizeStepMpText.includes("dice")) {
      diceStep = Number(
        sizeStepMpText.split("another")[1].split("hit")[0].trim(),
      );
    } else if (sizeStepMpText.includes("die")) {
      diceStep = 1;
    }
    const sizeStep = Number(
      sizeStepMpText.split("every ")[1].split(" additional")[0],
    );
    let mpDieNumberFormula = parameters.statDice.mp["number.saved"];
    let baseMpDieNumber = Number(mpDieNumberFormula);
    baseMpDieNumber -= diceStep * (parameters.size.value / sizeStep);
    mpDieNumberFormula = `${diceStep > 1 ? `${diceStep} * ` : ""}${
      sizeStep > 1 ? `(@size) / ${sizeStep})` : `@size`
    }${baseMpDieNumber !== 0 ? ` ${baseMpDieNumber < 0 ? "-" : "+"} ${Math.abs(baseMpDieNumber)}` : ""}`;
    parameters.statDice.mp["number.saved"] = mpDieNumberFormula;
  }
  cleanObject(parameters, [
    "appearance",
    "attributeIncrease",
    "description",
    "hpIncrease",
    "mpIncrease",
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
