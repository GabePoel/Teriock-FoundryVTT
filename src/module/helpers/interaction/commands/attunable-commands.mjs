import { selectDocumentsDialog } from "../../../applications/dialogs/select-document-dialog.mjs";
import { icons } from "../../../constants/display/icons.mjs";

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function takeAttune(actor) {
  const choices = [...actor.equipment, ...actor.mounts].filter(
    (a) => !a.system.isAttuned,
  );
  const chosen = await selectDocumentsDialog(choices, {
    title: "TERIOCK.SYSTEMS.Attunable.MENU.attune",
    hint: "TERIOCK.COMMANDS.Attune.hint",
    localize: true,
  });
  await Promise.all(chosen.map((a) => a.system.attune()));
}

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function takeDeattune(actor) {
  const choices = [...actor.equipment, ...actor.mounts].filter(
    (a) => a.system.isAttuned,
  );
  const chosen = await selectDocumentsDialog(choices, {
    title: "TERIOCK.SYSTEMS.Attunable.MENU.deattune",
    hint: "TERIOCK.COMMANDS.Deattune.hint",
    localize: true,
  });
  await Promise.all(chosen.map((a) => a.system.deattune()));
}

/**
 * Attune command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const attuneCommand = {
  icon: icons.attunable.attune,
  id: "attune",
  label: "TERIOCK.SYSTEMS.Attunable.MENU.attune",
  primary: takeAttune,
  secondary: takeDeattune,
};

/**
 * Deattune command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const deattuneCommand = {
  icon: icons.attunable.deattune,
  id: "deattune",
  label: "TERIOCK.SYSTEMS.Attunable.MENU.deattune",
  primary: takeDeattune,
  secondary: takeAttune,
};
