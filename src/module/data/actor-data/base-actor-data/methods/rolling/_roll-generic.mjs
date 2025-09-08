import { TeriockRoll } from "../../../../../dice/_module.mjs";
import { TeriockChatMessage } from "../../../../../documents/_module.mjs";
import { tradecraftMessage } from "../../../../../helpers/html.mjs";

/**
 * Rolls a feat save for the specified attribute.
 *
 * Relevant wiki pages:
 * - [Feat Interaction](https://wiki.teriock.com/index.php/Core:Feat_Interaction)
 *
 * @param {TeriockBaseActorData} actorData
 * @param {Teriock.Parameters.Actor.Attribute} attribute - The attribute to roll a feat save for.
 * @param {Teriock.RollOptions.CommonRoll} [options] - Options for the roll.
 * @private
 */
export async function _rollFeatSave(actorData, attribute, options = {}) {
  const actor = actorData.parent;
  let rollFormula = "1d20";
  if (options.advantage && !options.disadvantage) {
    rollFormula = "2d20kh1";
  } else if (options.disadvantage && !options.advantage) {
    rollFormula = "2d20kl1";
  }
  rollFormula += ` + @att.${attribute}.save`;
  const context = {
    diceClass: "feat",
  };
  if (typeof options.threshold === "number") {
    context.threshold = options.threshold;
  }
  const roll = new TeriockRoll(rollFormula, actor.getRollData(), { context });
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    flavor:
      (typeof options.threshold === "number"
        ? `DC ${options.threshold} `
        : "") + `${attribute.toUpperCase()} Feat Save`,
  });
}

/**
 * Rolls a resistance save.
 *
 * Relevant wiki pages:
 * - [Resistance](https://wiki.teriock.com/index.php/Ability:Resist_Effects)
 *
 * @param {TeriockBaseActorData} actorData
 * @param {Teriock.RollOptions.CommonRoll} [options] - Options for the roll.
 * @private
 */
export async function _rollResistance(actorData, options = {}) {
  const actor = actorData.parent;
  console.log(options.message);
  let rollFormula = "1d20";
  if (options.advantage && !options.disadvantage) {
    rollFormula = "2d20kh1";
  } else if (options.disadvantage && !options.advantage) {
    rollFormula = "2d20kl1";
  }
  rollFormula += " + @p";
  const roll = new TeriockRoll(rollFormula, actor.getRollData(), {
    flavor: "Resistance Save",
    context: {
      isResistance: true,
      diceClass: "resist",
      threshold: 10,
    },
  });
  await roll.evaluate();
  TeriockChatMessage.create({
    speaker: TeriockChatMessage.getSpeaker({ actor: actor }),
    rolls: [roll],
    system: {
      extraContent: options.message,
    },
  });
}

/**
 * Rolls an immunity save (these always succeed).
 *
 * Relevant wiki pages:
 * - [Immunity](https://wiki.teriock.com/index.php/Keyword:Immunity)
 *
 * @param {TeriockBaseActorData} actorData
 * @param {Teriock.RollOptions.CommonRoll} [_options] - Options for the roll.
 * @private
 */
export async function _rollImmunity(actorData, _options = {}) {
  await TeriockChatMessage.create({
    speaker: TeriockChatMessage.getSpeaker({ actor: actorData.parent }),
    title: "Immune",
    content: _options.message || "No effect.",
  });
}

/**
 * Rolls a tradecraft check.
 *
 * Relevant wiki pages:
 * - [Tradecrafts](https://wiki.teriock.com/index.php/Core:Tradecrafts)
 *
 * @param {TeriockBaseActorData} actorData
 * @param {Teriock.Parameters.Fluency.Tradecraft} tradecraft - The tradecraft to roll for.
 * @param {Teriock.RollOptions.CommonRoll} [options] - Options for the roll.
 * @private
 */
export async function _rollTradecraft(actorData, tradecraft, options = {}) {
  const actor = actorData.parent;
  const { proficient, extra } = actorData.tradecrafts[tradecraft] || {};
  let rollFormula = "1d20";
  if (options.advantage && !options.disadvantage) {
    rollFormula = "2d20kh1";
  } else if (options.disadvantage && !options.advantage) {
    rollFormula = "2d20kl1";
  }
  if (extra) rollFormula += ` + @tc.${tradecraft.slice(0, 3)}`;
  if (proficient) rollFormula += " + @p";
  const context = {};
  if (typeof options.threshold === "number") {
    context.threshold = options.threshold;
  }
  const roll = new TeriockRoll(rollFormula, actor.getRollData(), {
    flavor: `${TERIOCK.index.tradecrafts[tradecraft]} Check`,
    context,
  });
  await roll.evaluate();
  TeriockChatMessage.create({
    speaker: TeriockChatMessage.getSpeaker({ actor: actorData.parent }),
    rolls: [roll],
    system: {
      extraContent: await tradecraftMessage(tradecraft),
    },
  });
}
