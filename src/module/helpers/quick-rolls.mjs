import { TeriockRoll } from "../dice/_module.mjs";
import { TeriockChatMessage } from "../documents/_module.mjs";
import { makeDamageDrainTypePanels, makeDamageTypeButtons } from "./html.mjs";

/**
 * Roll with harm buttons.
 * @param {string} formula
 * @param {object} rollData
 * @param {string} message
 * @param {Teriock.MessageData.MessagePanel[]} panels
 * @returns {Promise<TeriockChatMessage>}
 */
export async function harmRoll(
  formula,
  rollData = {},
  message = "",
  panels = [],
) {
  const roll = new TeriockRoll(formula, rollData, { flavor: "Harm Roll" });
  await roll.evaluate();
  const buttons = /** @type {Teriock.UI.HTMLButtonConfig[]} */ [
    {
      label: "Damage",
      icon: "fas fa-heart-crack",
      classes: ["teriock-chat-button", "damage-button"],
      dataset: {
        action: "take-rollable-take",
        type: "damage",
        amount: roll.total.toString(),
      },
    },
    {
      label: "Drain",
      icon: "fas fa-droplet-slash",
      classes: ["teriock-chat-button", "drain-button"],
      dataset: {
        action: "take-rollable-take",
        type: "drain",
        amount: roll.total.toString(),
      },
    },
    {
      label: "Wither",
      icon: "fas fa-hourglass-half",
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
  const chatData = {
    speaker: TeriockChatMessage.speaker,
    rolls: [roll],
    system: {
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
  return TeriockChatMessage.create(chatData);
}
