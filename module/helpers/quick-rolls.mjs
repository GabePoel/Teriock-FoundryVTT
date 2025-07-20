import TeriockChatMessage from "../documents/chat-message.mjs";
import TeriockRoll from "../documents/roll.mjs";

/**
 * Roll with harm buttons.
 *
 * @param {string} formula
 * @param {object} rollData
 * @param {string} message
 * @returns {Promise<TeriockChatMessage>}
 */
export async function harmRoll(formula, rollData = {}, message = "") {
  const roll = new TeriockRoll(formula, rollData);
  await roll.evaluate();
  /** @type {Teriock.HTMLButtonConfig[]} */
  const buttons = [
    {
      label: "Damage",
      icon: "fas fa-heart",
      classes: ["teriock-chat-button", "damage-button"],
      dataset: {
        action: "take-rollable-take",
        type: "damage",
        amount: roll.total,
      },
    },
    {
      label: "Drain",
      icon: "fas fa-brain",
      classes: ["teriock-chat-button", "drain-button"],
      dataset: {
        action: "take-rollable-take",
        type: "drain",
        amount: roll.total,
      },
    },
    {
      label: "Wither",
      icon: "fas fa-hourglass-half",
      classes: ["teriock-chat-button", "wither-button"],
      dataset: {
        action: "take-rollable-take",
        type: "wither",
        amount: roll.total,
      },
    },
  ];
  return await TeriockChatMessage.create({
    speaker: TeriockChatMessage.speaker,
    flavor: "Harm Roll",
    rolls: [roll],
    system: {
      buttons: buttons,
      columns: 3,
      extraContent: message,
    },
  });
}
