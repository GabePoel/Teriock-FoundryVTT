import { TeriockRoll } from "../dice/_module.mjs";
import { TeriockChatMessage } from "../documents/_module.mjs";
import { makeDamageDrainTypePanels, makeDamageTypeButtons } from "./html.mjs";

/**
 * Roll with harm buttons.
 * @param {string} formula
 * @param {object} rollData
 * @param {string} message
 * @param {Teriock.MessageData.MessagePanel[]} panels
 * @param {TeriockActor} [actor]
 * @returns {Promise<TeriockChatMessage>}
 */
export async function harmRoll(
  formula,
  rollData = {},
  message = "",
  panels = [],
  actor = null,
) {
  const roll = new TeriockRoll(formula, rollData, { flavor: "Harm Roll" });
  await roll.evaluate();
  const buttons = /** @type {Teriock.UI.HTMLButtonConfig[]} */ [
    {
      label: "Damage",
      icon: TERIOCK.options.take.damage.icon,
      classes: ["teriock-chat-button", "damage-button"],
      dataset: {
        action: "take-rollable-take",
        type: "damage",
        amount: roll.total.toString(),
      },
    },
    {
      label: "Drain",
      icon: TERIOCK.options.take.drain.icon,
      classes: ["teriock-chat-button", "drain-button"],
      dataset: {
        action: "take-rollable-take",
        type: "drain",
        amount: roll.total.toString(),
      },
    },
    {
      label: "Wither",
      icon: TERIOCK.options.take.wither.icon,
      classes: ["teriock-chat-button", "wither-button"],
      dataset: {
        action: "take-rollable-take",
        type: "wither",
        amount: roll.total.toString(),
      },
    },
  ];
  const damageTypeButtons = makeDamageTypeButtons(roll);
  buttons.push(...damageTypeButtons);
  const damageDrainPanels = await makeDamageDrainTypePanels(roll);
  panels.push(...damageDrainPanels);
  let speaker;
  if (actor) {
    speaker = TeriockChatMessage.getSpeaker({ actor: actor });
  } else {
    speaker = TeriockChatMessage.getSpeaker();
    if (actor) {
      //noinspection JSUnresolvedReference
      actor = game.actors.get(speaker.actor);
    }
  }
  const chatData = {
    speaker: speaker,
    rolls: [roll],
    system: {
      avatar: actor?.img,
      buttons: buttons,
      columns: damageTypeButtons.length > 0 ? 2 : 3,
      extraContent: message,
      panels: panels,
    },
  };
  TeriockChatMessage.applyRollMode(
    chatData,
    game.settings.get("core", "rollMode"),
  );
  return TeriockChatMessage.create(chatData, {
    rollMode: game.settings.get("core", "rollMode"),
  });
}
/**
 * Make common roll options.
 * @param {MouseEvent} event
 * @returns {Teriock.RollOptions.CommonRoll | Teriock.RollOptions.EquipmentRoll}
 */
export function makeCommonRollOptions(event) {
  let secret = game.settings.get("teriock", "secretEquipment");
  if (event.shiftKey) {
    secret = !secret;
  }
  return {
    advantage: event.altKey,
    disadvantage: event.shiftKey,
    crit: event.altKey,
    secret: secret,
    twoHanded: event.ctrlKey,
  };
}
