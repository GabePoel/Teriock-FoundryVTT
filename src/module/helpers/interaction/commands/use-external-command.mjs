import { selectDocumentsDialog } from "../../../applications/dialogs/select-document-dialog.mjs";
import { icons } from "../../../constants/display/icons.mjs";
import { resolveDocuments } from "../../resolve.mjs";
import { thresholdCommand } from "./abstract-command.mjs";

/**
 * @param {TeriockActor} actor
 * @param {boolean} showDialog
 * @param {Teriock.Interaction.UseExternalOptions} options
 * @returns {Promise<void>}
 */
async function use(actor, showDialog, options = {}) {
  if (!actor) {
    ui.notifications.error("TERIOCK.DIALOGS.Common.ERRORS.noActor", {
      localize: true,
    });
  }
  if (!options.uuid) {
    ui.notifications.error("TERIOCK.COMMANDS.UseExternal.noUuid", {
      localize: true,
    });
  }
  if (["number", "string"].includes(typeof options.competence)) {
    options.proficient = Number(options.competence) >= 1;
    options.fluent = Number(options.competence) >= 2;
  }
  const documents = await resolveDocuments([options.uuid], {
    ...options,
    expandFolders: true,
  });
  const chosen =
    documents.length > 1 ? await selectDocumentsDialog(documents) : documents;
  await Promise.all(
    chosen.map((c) => c.use({ ...options, actor, showDialog })),
  );
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.UseExternalOptions} options
 * @returns {Promise<void>}
 */
async function primary(actor, options = {}) {
  await use(actor, game.teriock.getSetting("showRollDialogs"), options);
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.UseExternalOptions} options
 * @returns {Promise<void>}
 */
async function secondary(actor, options = {}) {
  await use(actor, !game.teriock.getSetting("showRollDialogs"), options);
}

/**
 * Use external document command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  args: ["uuid"],
  icon: (options) => options?.icon || icons.ui.document,
  id: "use-external",
  label: (options) =>
    options?.label ||
    game.i18n.localize("TERIOCK.COMMANDS.UseDocument.useUnnamed"),
  primary,
  secondary,
};

export default command;
