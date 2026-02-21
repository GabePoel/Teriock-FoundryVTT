import { icons } from "../../../constants/display/icons.mjs";

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function primary(actor) {
  await actor.system.takeAwaken();
}

/**
 * Awaken command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  icon: icons.effect.awaken,
  id: "awaken",
  label: "TERIOCK.EFFECTS.Common.awaken",
  primary,
};

export default command;
