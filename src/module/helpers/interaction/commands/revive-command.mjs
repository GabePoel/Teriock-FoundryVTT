import { icons } from "../../../constants/display/icons.mjs";

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function primary(actor) {
  await actor.system.takeRevive();
}

/**
 * Awaken command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  icon: icons.effect.revive,
  id: "revive",
  label: "Revive",
  primary,
};

export default command;
