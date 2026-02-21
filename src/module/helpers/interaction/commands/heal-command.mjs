import { icons } from "../../../constants/display/icons.mjs";

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function primary(actor) {
  await actor.system.takeHeal();
}

const command = {
  icon: icons.effect.heal,
  id: "heal",
  label: "TERIOCK.EFFECTS.Common.heal",
  primary,
};

export default command;
