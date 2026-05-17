import { selectDocumentsDialog } from "../../../applications/dialogs/select-document-dialog.mjs";
import { icons } from "../../../constants/display/icons.mjs";
import { resolveDocuments } from "../../resolve.mjs";
import { inferIconFromIdentifier, inferNameFromIdentifier } from "../../utils.mjs";
import { thresholdCommand } from "./abstract-command.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.UseExternalOptions} options
 * @returns {void|false}
 */
function preUse(actor, options = {}) {
  if (!game.actors.check(actor)) return false;
  if (["number", "string"].includes(typeof options.competence)) {
    options.proficient = Number(options.competence) >= 1;
    options.fluent = Number(options.competence) >= 2;
  }
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.UseLocalOptions} options
 * @returns {Promise<void>}
 */
async function useLocal(actor, options = {}) {
  if (preUse(actor, options) === false) return;
  if (!options.lookup) {
    ui.notifications.error("TERIOCK.COMMANDS.UseLocal.noLookup", {
      localize: true,
    });
    return;
  }
  await actor.useDocument(options.lookup, options);
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.UseExternalOptions} options
 * @returns {Promise<void>}
 */
async function useExternal(actor, options = {}) {
  if (preUse(actor, options) === false) return;
  if (!options.uuid) {
    ui.notifications.error("TERIOCK.COMMANDS.UseExternal.noUuid", {
      localize: true,
    });
    return;
  }
  const documents = await resolveDocuments([options.uuid], {
    ...options,
    expandFolders: true,
  });
  const chosen = documents.length > 1 ? await selectDocumentsDialog(documents) : documents;
  await Promise.all(chosen.map(c => c.use({ ...options, actor })));
}

/**
 * Use local document command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const useLocalCommand = {
  ...thresholdCommand,
  aliases: ["use"],
  args: ["lookup"],
  icon: options => inferIconFromIdentifier(options?.lookup),
  id: "use-local",
  label: options =>
    _loc("TERIOCK.COMMANDS.UseDocument.useNamed", {
      name: inferNameFromIdentifier(options?.lookup) || "",
    }),
  primary: useLocal,
  secondary: useLocal,
};

/**
 * Use external document command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const useExternalCommand = {
  ...thresholdCommand,
  args: ["uuid"],
  icon: options => options?.icon || icons.ui.document,
  id: "use-external",
  label: options => options?.label || _loc("TERIOCK.COMMANDS.UseDocument.useUnnamed"),
  primary: useExternal,
  secondary: useExternal,
};
