import { selectDocumentsDialog } from "../../../applications/dialogs/select-document-dialog.mjs";
import { icons } from "../../../constants/display/icons.mjs";

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function takeShatter(actor) {
  const choices = actor.equipment.filter((e) => !e.system.shattered);
  const chosen = await selectDocumentsDialog(choices, {
    title: "TERIOCK.SYSTEMS.Equipment.MENU.shatter",
    hint: "TERIOCK.COMMANDS.Shatter.hint",
    localize: true,
  });
  await Promise.all(chosen.map((e) => e.system.shatter()));
}

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function takeRepair(actor) {
  const choices = actor.equipment.filter((e) => e.system.shattered);
  const chosen = await selectDocumentsDialog(choices, {
    title: "TERIOCK.SYSTEMS.Equipment.MENU.repair",
    hint: "TERIOCK.COMMANDS.Repair.hint",
    localize: true,
  });
  await Promise.all(chosen.map((e) => e.system.repair()));
}

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function takeDestroy(actor) {
  const choices = actor.equipment.filter((e) => !e.system.destroyed);
  const chosen = await selectDocumentsDialog(choices, {
    title: "TERIOCK.SYSTEMS.Equipment.MENU.destroy",
    hint: "TERIOCK.COMMANDS.Destroy.hint",
    localize: true,
  });
  await Promise.all(chosen.map((e) => e.system.destroy()));
}

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function takeReforge(actor) {
  const choices = actor.equipment.filter((e) => e.system.destroyed);
  const chosen = await selectDocumentsDialog(choices, {
    title: "TERIOCK.SYSTEMS.Equipment.MENU.reforge",
    hint: "TERIOCK.COMMANDS.Reforge.hint",
    localize: true,
  });
  await Promise.all(chosen.map((e) => e.system.reforge()));
}

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function takeGlue(actor) {
  const choices = actor.equipment.filter((e) => !e.system.glued);
  const chosen = await selectDocumentsDialog(choices, {
    title: "TERIOCK.SYSTEMS.Equipment.MENU.glue",
    hint: "TERIOCK.COMMANDS.Glue.hint",
    localize: true,
  });
  await Promise.all(chosen.map((e) => e.system.glue()));
}

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function takeUnglue(actor) {
  const choices = actor.equipment.filter((e) => e.system.glued);
  const chosen = await selectDocumentsDialog(choices, {
    title: "TERIOCK.SYSTEMS.Equipment.MENU.unglue",
    hint: "TERIOCK.COMMANDS.Unglue.hint",
    localize: true,
  });
  await Promise.all(chosen.map((e) => e.system.unglue()));
}

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function takeDampen(actor) {
  const choices = actor.equipment.filter((e) => !e.system.dampened);
  const chosen = await selectDocumentsDialog(choices, {
    title: "TERIOCK.SYSTEMS.Equipment.MENU.dampen",
    hint: "TERIOCK.COMMANDS.Dampen.hint",
    localize: true,
  });
  await Promise.all(chosen.map((e) => e.system.dampen()));
}

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function takeUndampen(actor) {
  const choices = actor.equipment.filter((e) => e.system.dampened);
  const chosen = await selectDocumentsDialog(choices, {
    title: "TERIOCK.SYSTEMS.Equipment.MENU.undampen",
    hint: "TERIOCK.COMMANDS.Undampen.hint",
    localize: true,
  });
  await Promise.all(chosen.map((e) => e.system.undampen()));
}

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function takeIdentify(actor) {
  const choices = actor.equipment.filter(
    (e) => !e.system.identification.identified,
  );
  const chosen = await selectDocumentsDialog(choices, {
    title: "TERIOCK.SYSTEMS.Equipment.MENU.identify",
    hint: "TERIOCK.COMMANDS.Identify.hint",
    localize: true,
  });
  await Promise.all(chosen.map((e) => e.system.identification.identify()));
}

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function takeReadMagic(actor) {
  const choices = actor.equipment.filter((e) => !e.system.identification.read);
  const chosen = await selectDocumentsDialog(choices, {
    title: "TERIOCK.SYSTEMS.Equipment.MENU.glue",
    hint: "TERIOCK.COMMANDS.Glue.hint",
    localize: true,
  });
  await Promise.all(chosen.map((e) => e.system.identification.readMagic()));
}

/**
 * Shatter command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const shatterCommand = {
  icon: icons.break.shatter,
  id: "shatter",
  label: "TERIOCK.SYSTEMS.Equipment.MENU.shatter",
  primary: takeShatter,
  secondary: takeRepair,
};

/**
 * Repair command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const repairCommand = {
  icon: icons.break.repair,
  id: "repair",
  label: "TERIOCK.SYSTEMS.Equipment.MENU.repair",
  primary: takeRepair,
  secondary: takeShatter,
};

/**
 * Destroy command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const destroyCommand = {
  icon: icons.break.destroy,
  id: "destroy",
  label: "TERIOCK.SYSTEMS.Equipment.MENU.destroy",
  primary: takeDestroy,
  secondary: takeReforge,
};

/**
 * Reforge command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const reforgeCommand = {
  icon: icons.break.reforge,
  id: "reforge",
  label: "TERIOCK.SYSTEMS.Equipment.MENU.reforge",
  primary: takeReforge,
  secondary: takeDestroy,
};

/**
 * Glue command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const glueCommand = {
  icon: icons.equipment.glue,
  id: "glue",
  label: "TERIOCK.SYSTEMS.Equipment.MENU.glue",
  primary: takeGlue,
  secondary: takeUnglue,
};

/**
 * Unglue command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const unglueCommand = {
  icon: icons.equipment.unglue,
  id: "unglue",
  label: "TERIOCK.SYSTEMS.Equipment.MENU.unglue",
  primary: takeUnglue,
  secondary: takeGlue,
};

/**
 * Dampen command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const dampenCommand = {
  icon: icons.equipment.dampen,
  id: "dampen",
  label: "TERIOCK.SYSTEMS.Equipment.MENU.dampen",
  primary: takeDampen,
  secondary: takeUndampen,
};

/**
 * Undampen command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const undampenCommand = {
  icon: icons.equipment.undampen,
  id: "undampen",
  label: "TERIOCK.SYSTEMS.Equipment.MENU.undampen",
  primary: takeUndampen,
  secondary: takeDampen,
};

/**
 * Identify command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const identifyCommand = {
  icon: icons.equipment.identify,
  id: "identify",
  label: "TERIOCK.SYSTEMS.Equipment.MENU.identify",
  primary: takeIdentify,
};

/**
 * Read magic command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const readMagicCommand = {
  icon: icons.equipment.readMagic,
  id: "readMagic",
  label: "TERIOCK.SYSTEMS.Equipment.MENU.readMagic",
  primary: takeReadMagic,
};
