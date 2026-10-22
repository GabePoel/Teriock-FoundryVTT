import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

/**
 * Awaken command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  icon: TERIOCK.DISPLAY.icons.manifest.effect.awaken,
  id: "awaken",
  label: "TERIOCK.EFFECTS.Common.awaken",
  primary: simpleCommandFunctionFactory(a => a.system.takeAwaken()),
};

export default command;
