import { icons } from "../../../constants/display/icons.mjs";
import { thresholdCommand } from "./abstract-command.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.ResistOptions} options
 * @returns {Promise<void>}
 */
async function use(actor, options = {}) {
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
  label: (options) =>
    options?.hex
      ? game.i18n.localize("TERIOCK.ROLLS.Hexproof.button")
      : game.i18n.localize("TERIOCK.ROLLS.Resist.button"),
  primary: use,
  secondary: use,
};

export default command;
