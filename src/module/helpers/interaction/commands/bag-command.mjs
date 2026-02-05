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
 * @type {Teriock.Interactions.CommandEntry}
 */
const command = {
  icon: icons.ui.deathBag,
  id: "bag",
  label: "Death Bag Pull",
  primary,
};

export default command;
