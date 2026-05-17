import { icons } from "../../../constants/display/icons.mjs";
import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

/**
 * Bag command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  icon: icons.ui.deathBag,
  id: "bag",
  label: "TERIOCK.EFFECTS.Common.bag",
  primary: simpleCommandFunctionFactory(a => a.system.deathBagPull()),
};

export default command;
