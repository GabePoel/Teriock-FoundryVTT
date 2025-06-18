/** @import TeriockActor from "../../../../../documents/_module.mjs"; */
/** @import TeriockRoll from "../../../../../documents/roll.mjs"; */

/**
 * Rolls a feat save for the actor.
 * @param {TeriockActor} actor 
 * @param {string} attribute - The attribute to roll the save against (e.g., "strength", "dexterity").
 * @param {object} [options] - Options for the roll, such as advantage or disadvantage.
 */
export function _rollFeatSave(actor, attribute, options = {}) {
  const bonus = actor.system[`${attribute}Save`] || 0;
  const adv = options.advantage ? "kh1" : options.disadvantage ? "kl1" : "";
  const formula = `2d20${adv || ""}`.replace(/^2d20$/, "1d20") + ` + ${bonus}`;
  new TeriockRoll(formula).evaluate({ async: true }).then(result => {
    result.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${attribute.toUpperCase()} Feat Save`,
    });
  });
}

/**
 * Rolls a resistance save for the actor.
 * @param {TeriockActor} actor 
 * @param {object} [options] 
 */
export function _rollResistance(actor, options = {}) {
  let rollFormula = "1d20";
  if (options.advantage) {
    rollFormula = "2d20kh1";
  } else if (options.disadvantage) {
    rollFormula = "2d20kl1";
  }
  rollFormula += ' + @p';
  const rollData = actor.getRollData();
  const roll = new TeriockRoll(rollFormula, rollData, {
    context: {
      isResistance: true,
      diceClass: 'resist',
      threshold: 10,
    }
  });
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: this }),
    flavor: "Resistance Save",
  });
}

/**
 * Rolls a tradecraft check for the actor.
 * @param {TeriockActor} actor 
 * @param {string} tradecraft 
 * @param {object} [options] 
 */
export function _rollTradecraft(actor, tradecraft, options = {}) {
  const { proficient, extra } = actor.system.tradecrafts[tradecraft] || {};
  let formula = options.advantage ? '2d20kh1' : options.disadvantage ? '2d20kl1' : '1d20';
  if (proficient) formula += ' + @p';
  if (extra) formula += ` + @${tradecraft}`;
  new TeriockRoll(formula, actor.getRollData()).evaluate({ async: true }).then(result => {
    result.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${tradecraft.charAt(0).toUpperCase() + tradecraft.slice(1)} Check`,
    });
  });
}