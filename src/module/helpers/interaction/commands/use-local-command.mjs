import { inferNameFromIdentifier } from "../../utils.mjs";
import { thresholdCommand } from "./abstract-command.mjs";

/**
 * @param {TeriockActor} actor
 * @param {boolean} showDialog
 * @param {Teriock.Interaction.UseLocalOptions} options
 * @returns {Promise<void>}
 */
async function use(actor, showDialog, options = {}) {
  if (!actor) {
    ui.notifications.error("TERIOCK.DIALOGS.Common.ERRORS.noActor", {
      localize: true,
    });
  }
  if (!options.lookup) {
    ui.notifications.error("TERIOCK.COMMANDS.UseLocal.noLookup", {
      localize: true,
    });
    return;
  }
  await actor.useDocument(options.lookup, { ...options, showDialog });
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.UseLocalOptions} options
 * @returns {Promise<void>}
 */
async function primary(actor, options = {}) {
  await use(actor, game.teriock.getSetting("showRollDialogs"), options);
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.UseAbilityOptions} options
 * @returns {Promise<void>}
 */
async function secondary(actor, options = {}) {
  await use(actor, !game.teriock.getSetting("showRollDialogs"), options);
}

/**
 * Use ability command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  aliases: ["use"],
  args: ["lookup"],
  icon: (options) => TERIOCK.options.document[options?.type || "document"].icon,
  id: "useLocal",
  label: (options) =>
    inferNameFromIdentifier(options?.lookup, options?.type) || "",
  primary,
  secondary,
};

export default command;
