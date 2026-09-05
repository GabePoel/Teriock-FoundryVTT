import { icons } from "../../../constants/display/_module.mjs";
import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

/**
 * Awaken command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  icon: icons.manifest.effect.revive,
  id: "revive",
  label: "TERIOCK.EFFECTS.Common.revive",
  primary: simpleCommandFunctionFactory(a => a.system.takeRevive()),
};

export default command;
