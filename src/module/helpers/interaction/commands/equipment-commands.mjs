import { selectDocumentsDialog } from "../../../applications/dialogs/select-document-dialog.mjs";
import { icons } from "../../../constants/display/icons.mjs";

/**
 * Build an equipment command function.
 * @param {((equipment: TeriockEquipment) => boolean)} filter
 * @param {((equipment: TeriockEquipment) => Promise<*>)} onSelect
 * @param {string} hint
 * @param {string} title
 * @returns {(actor: TeriockActor) => Promise<void>}
 */
function equipmentCommandFunctionFactory(filter, onSelect, hint, title) {
  return async function equipmentCommandFunction(actor) {
    if (!game.actors.check(actor)) return;
    const choices = actor.equipment.filter(filter);
    const chosen = await selectDocumentsDialog(choices, {
      hint,
      localize: true,
      noDocumentsMessage: "TERIOCK.DIALOGS.Common.ERRORS.noRelevantItems",
      title,
    });
    await Promise.all(chosen.map(e => onSelect(e)));
  };
}

/** @see {EquipmentSuppressionPart.shatter} */
const takeShatter = equipmentCommandFunctionFactory(
  e => !e.system.shattered,
  e => e.system.shatter(),
  "TERIOCK.COMMANDS.Shatter.hint",
  "TERIOCK.SYSTEMS.Equipment.MENU.shatter",
);

/** @see {EquipmentSuppressionPart.repair} */
const takeRepair = equipmentCommandFunctionFactory(
  e => e.system.shattered,
  e => e.system.repair(),
  "TERIOCK.COMMANDS.Repair.hint",
  "TERIOCK.SYSTEMS.Equipment.MENU.repair",
);

/** @see {EquipmentSuppressionPart.destroy} */
const takeDestroy = equipmentCommandFunctionFactory(
  e => !e.system.destroyed,
  e => e.system.destroy(),
  "TERIOCK.COMMANDS.Destroy.hint",
  "TERIOCK.SYSTEMS.Equipment.MENU.destroy",
);

/** @see {EquipmentSuppressionPart.reforge} */
const takeReforge = equipmentCommandFunctionFactory(
  e => e.system.destroyed,
  e => e.system.reforge(),
  "TERIOCK.COMMANDS.Reforge.hint",
  "TERIOCK.SYSTEMS.Equipment.MENU.reforge",
);

/** @see {EquipmentWieldingPart.glue} */
const takeGlue = equipmentCommandFunctionFactory(
  e => !e.system.glued,
  e => e.system.glue(),
  "TERIOCK.COMMANDS.Glue.hint",
  "TERIOCK.SYSTEMS.Equipment.MENU.glue",
);

/** @see {EquipmentWieldingPart.unglue} */
const takeUnglue = equipmentCommandFunctionFactory(
  e => e.system.glued,
  e => e.system.unglue(),
  "TERIOCK.COMMANDS.Unglue.hint",
  "TERIOCK.SYSTEMS.Equipment.MENU.unglue",
);

/** @see {EquipmentSuppressionPart.dampen} */
const takeDampen = equipmentCommandFunctionFactory(
  e => !e.system.dampened,
  e => e.system.dampen(),
  "TERIOCK.COMMANDS.Dampen.hint",
  "TERIOCK.SYSTEMS.Equipment.MENU.dampen",
);

/** @see {EquipmentSuppressionPart.undampen} */
const takeUndampen = equipmentCommandFunctionFactory(
  e => e.system.dampened,
  e => e.system.undampen(),
  "TERIOCK.COMMANDS.Undampen.hint",
  "TERIOCK.SYSTEMS.Equipment.MENU.undampen",
);

/** @see {IdentificationModel.identify} */
const takeIdentify = equipmentCommandFunctionFactory(
  e => !e.system.identification.identified,
  e => e.system.identification.identify(),
  "TERIOCK.COMMANDS.Identify.hint",
  "TERIOCK.SYSTEMS.Equipment.MENU.identify",
);

/** @see {IdentificationModel.readMagic} */
const takeReadMagic = equipmentCommandFunctionFactory(
  e => !e.system.identification.read,
  e => e.system.identification.readMagic(),
  "TERIOCK.COMMANDS.Glue.hint",
  "TERIOCK.SYSTEMS.Equipment.MENU.glue",
);

/**
 * Shatter command
 * @type {Teriock.Command.CommandEntry}
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
 * @type {Teriock.Command.CommandEntry}
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
 * @type {Teriock.Command.CommandEntry}
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
 * @type {Teriock.Command.CommandEntry}
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
 * @type {Teriock.Command.CommandEntry}
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
 * @type {Teriock.Command.CommandEntry}
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
 * @type {Teriock.Command.CommandEntry}
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
 * @type {Teriock.Command.CommandEntry}
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
 * @type {Teriock.Command.CommandEntry}
 */
export const identifyCommand = {
  icon: icons.equipment.identify,
  id: "identify",
  label: "TERIOCK.SYSTEMS.Equipment.MENU.identify",
  primary: takeIdentify,
};

/**
 * Read magic command
 * @type {Teriock.Command.CommandEntry}
 */
export const readMagicCommand = {
  icon: icons.equipment.readMagic,
  id: "readMagic",
  label: "TERIOCK.SYSTEMS.Equipment.MENU.readMagic",
  primary: takeReadMagic,
};
