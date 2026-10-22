import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

/**
 * Awaken command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  icon: TERIOCK.DISPLAY.icons.manifest.effect.revive,
  id: "revive",
  label: "TERIOCK.EFFECTS.Common.revive",
  primary: simpleCommandFunctionFactory(a => a.system.takeRevive()),
};

export default command;
