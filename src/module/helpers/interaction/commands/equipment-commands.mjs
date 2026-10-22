import { DocumentSelector } from "../../../applications/dialogs/_module.mjs";

/**
 * Build an equipment command function.
 * @param {((equipment: TeriockItem<"equipment">) => boolean)} filter
 * @param {((equipment: TeriockItem<"equipment">) => Promise<*>)} onSelect
 * @param {string} hint
 * @param {string} title
 * @returns {(actor: TeriockActor) => Promise<void>}
 */
function equipmentCommandFunctionFactory(filter, onSelect, hint, title) {
  return async function equipmentCommandFunction(actor) {
    if (!game.actors.check(actor)) { return; }
    const choices = actor.previewedTypes.equipment.filter(filter);
    const chosen = await DocumentSelector.selectMulti(choices, {
      hint: _loc(hint),
      noDocumentsMessage: _loc("TERIOCK.DIALOGS.Common.ERRORS.noRelevantItems"),
      title: _loc(title),
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

/** @see {EquipmentIdentificationPart.identify} */
const takeIdentify = equipmentCommandFunctionFactory(
  e => !e.system.identification.identified,
  e => e.system.identify(),
  "TERIOCK.COMMANDS.Identify.hint",
  "TERIOCK.SYSTEMS.Equipment.MENU.identify",
);

/** @see {EquipmentIdentificationPart.readMagic} */
const takeReadMagic = equipmentCommandFunctionFactory(
  e => !e.system.identification.read,
  e => e.system.readMagic(),
  "TERIOCK.COMMANDS.ReadMagic.hint",
  "TERIOCK.SYSTEMS.Equipment.MENU.readMagic",
);

/**
 * Shatter command
 * @type {Teriock.Command.CommandEntry}
 */
export const shatterCommand = {
  icon: TERIOCK.DISPLAY.icons.manifest.break.shatter,
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
  icon: TERIOCK.DISPLAY.icons.manifest.break.repair,
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
  icon: TERIOCK.DISPLAY.icons.manifest.break.destroy,
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
  icon: TERIOCK.DISPLAY.icons.manifest.break.reforge,
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
  icon: TERIOCK.DISPLAY.icons.manifest.equipment.glue,
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
  icon: TERIOCK.DISPLAY.icons.manifest.equipment.unglue,
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
  icon: TERIOCK.DISPLAY.icons.manifest.equipment.dampen,
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
  icon: TERIOCK.DISPLAY.icons.manifest.equipment.undampen,
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
  icon: TERIOCK.DISPLAY.icons.manifest.equipment.identify,
  id: "identify",
  label: "TERIOCK.SYSTEMS.Equipment.MENU.identify",
  primary: takeIdentify,
};

/**
 * Read magic command
 * @type {Teriock.Command.CommandEntry}
 */
export const readMagicCommand = {
  icon: TERIOCK.DISPLAY.icons.manifest.equipment.readMagic,
  id: "readMagic",
  label: "TERIOCK.SYSTEMS.Equipment.MENU.readMagic",
  primary: takeReadMagic,
};
