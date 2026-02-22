import { icons } from "../../../constants/display/icons.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Partial<Teriock.Dialog.StatDialogOptions>} [options]
 * @returns {Promise<void>}
 */
async function primary(actor, options = {}) {
  await actor.system.takeRevitalize(options);
}

const command = {
  icon: icons.effect.revitalize,
  id: "revitalize",
  label: "TERIOCK.EFFECTS.Common.revitalize",
  primary,
};

export default command;
