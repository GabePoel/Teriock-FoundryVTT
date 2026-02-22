import { icons } from "../../../constants/display/icons.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Partial<Teriock.Dialog.HealDialogOptions>} [options]
 * @returns {Promise<void>}
 */
async function primary(actor, options = {}) {
  await actor.system.takeHeal(options);
}

const command = {
  icon: icons.effect.heal,
  id: "heal",
  label: "TERIOCK.EFFECTS.Common.heal",
  primary,
};

export default command;
