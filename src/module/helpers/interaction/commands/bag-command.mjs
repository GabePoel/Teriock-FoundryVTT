import { icons } from "../../../constants/display/icons.mjs";

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function primary(actor) {
  await actor.system.deathBagPull();
}

/**
 * Bag command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  icon: icons.ui.deathBag,
  id: "bag",
  label: "TERIOCK.EFFECTS.Common.bag",
  primary,
};

export default command;
