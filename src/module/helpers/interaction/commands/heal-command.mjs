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
  label: "Heal",
  primary,
};

export default command;
