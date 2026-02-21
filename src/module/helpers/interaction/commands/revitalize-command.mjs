import { icons } from "../../../constants/display/icons.mjs";

/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function primary(actor) {
  await actor.system.takeRevitalize();
}

const command = {
  icon: icons.effect.revitalize,
  id: "revitalize",
  label: "TERIOCK.EFFECTS.Common.revitalize",
  primary,
};

export default command;
