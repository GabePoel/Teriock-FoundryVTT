import { icons } from "../../../constants/display/_module.mjs";
import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

/**
 * Awaken command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  icon: icons.manifest.effect.awaken,
  id: "awaken",
  label: "TERIOCK.EFFECTS.Common.awaken",
  primary: simpleCommandFunctionFactory(a => a.system.takeAwaken()),
};

export default command;
