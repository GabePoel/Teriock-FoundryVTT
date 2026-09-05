import { icons } from "../../../constants/display/_module.mjs";
import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

/**
 * Bag command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  icon: icons.manifest.ui.deathBag,
  id: "bag",
  label: "TERIOCK.EFFECTS.Common.bag",
  primary: simpleCommandFunctionFactory(a => a.system.deathBagPull()),
};

export default command;
