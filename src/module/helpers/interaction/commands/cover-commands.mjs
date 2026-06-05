import { icons } from "../../../constants/display/icons.mjs";

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function takeCover(actor) {
  if (game.actors.check(actor)) { await actor.system.increaseCover(); }
}

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function takeUncover(actor) {
  if (game.actors.check(actor)) { await actor.system.decreaseCover(); }
}

/**
 * Cover command
 * @type {Teriock.Command.CommandEntry}
 */
export const coverCommand = {
  icon: icons.cover.full,
  id: "cover",
  label: "TERIOCK.COMMANDS.Cover.label",
  primary: takeCover,
  secondary: takeUncover,
};

/**
 * Uncover command
 * @type {Teriock.Command.CommandEntry}
 */
export const uncoverCommand = {
  icon: icons.cover.half,
  id: "uncover",
  label: "TERIOCK.COMMANDS.Uncover.label",
  primary: takeUncover,
  secondary: takeCover,
};
