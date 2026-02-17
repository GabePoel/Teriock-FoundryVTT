import { icons } from "../../../constants/display/icons.mjs";
import { thresholdCommand } from "./abstract-command.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.ResistOptions} options
 * @returns {Promise<void>}
 */
async function primary(actor, options = {}) {
  options.showDialog = game.settings.get("teriock", "showRollDialogs");
  await actor.system.rollResistance(options);
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.ResistOptions} options
 * @returns {Promise<void>}
 */
async function secondary(actor, options = {}) {
  options.showDialog = !game.settings.get("teriock", "showRollDialogs");
  await actor.system.rollResistance(options);
}

/**
 * Resist command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  icon: icons.effect.resist,
  id: "resist",
  label: (options) => `Roll ${options?.hex ? "Hexproof" : "Resistance"}`,
  primary,
  secondary,
};

export default command;
