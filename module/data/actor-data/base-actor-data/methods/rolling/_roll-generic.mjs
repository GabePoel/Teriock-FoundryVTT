import TeriockRoll from "../../../../../documents/roll.mjs";

/**
 * Rolls a feat save for the actor.
 *
 * @param {TeriockBaseActorData} actorData
 * @param {string} attribute - The attribute to roll the save against (e.g., "strength", "dexterity").
 * @param {object} [options] - Options for the roll, such as advantage or disadvantage.
 * @private
 */
export async function _rollFeatSave(actorData, attribute, options = {}) {
  const actor = actorData.parent;
  const bonus = actorData[`${attribute}Save`] || 0;
  const adv = options.advantage ? "kh1" : options.disadvantage ? "kl1" : "";
  const formula = `2d20${adv || ""}`.replace(/^2d20$/, "1d20") + ` + ${bonus}`;
  const context = {
    diceClass: "feat",
  };
  if (typeof options.threshold === "number") {
    context.threshold = options.threshold;
  }
  const roll = new TeriockRoll(formula, actor.getRollData(), { context });
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    flavor:
      (typeof options.threshold === "number" ? `DC ${options.threshold} ` : "") +
      `${attribute.toUpperCase()} Feat Save`,
  });
}

/**
 * Rolls a resistance save for the actor.
 *
 * @param {TeriockBaseActorData} actorData
 * @param {object} [options]
 * @private
 */
export async function _rollResistance(actorData, options = {}) {
  const actor = actorData.parent;
  let message = null;
  if (options.message) {
    message = options.message;
  }
  let rollFormula = "1d20";
  if (options.advantage) {
    rollFormula = "2d20kh1";
  } else if (options.disadvantage) {
    rollFormula = "2d20kl1";
  }
  rollFormula += " + @p";
  const roll = new TeriockRoll(rollFormula, actor.getRollData(), {
    message: message,
    context: {
      isResistance: true,
      diceClass: "resist",
      threshold: 10,
    },
  });
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    flavor: "Resistance Save",
  });
}

/**
 * Rolls an immunity save for the actor.
 *
 * @param {TeriockBaseActorData} actorData
 * @param {object} [options]
 * @private
 */
export async function _rollImmunity(actorData, options = {}) {
  let message = null;
  if (options.message) {
    message = options.message;
  }
  await foundry.documents.ChatMessage.create({
    title: "Immune",
    flavor: "Immune",
    content: message || "No effect.",
  });
}

/**
 * Rolls a tradecraft check for the actor.
 *
 * @param {TeriockBaseActorData} actorData
 * @param {string} tradecraft
 * @param {object} [options]
 * @private
 */
export async function _rollTradecraft(actorData, tradecraft, options = {}) {
  const actor = actorData.parent;
  const { proficient, extra } = actorData.tradecrafts[tradecraft] || {};
  let formula = options.advantage ? "2d20kh1" : options.disadvantage ? "2d20kl1" : "1d20";
  if (proficient) formula += " + @p";
  if (extra) formula += ` + @${tradecraft}`;
  const roll = new TeriockRoll(formula, actor.getRollData());
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    flavor: `${tradecraft.charAt(0).toUpperCase() + tradecraft.slice(1)} Check`,
  });
}
