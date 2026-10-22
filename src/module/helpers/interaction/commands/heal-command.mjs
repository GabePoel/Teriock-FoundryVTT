import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

/**
 * Heal command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  icon: TERIOCK.DISPLAY.icons.manifest.effect.heal,
  id: "heal",
  label: "TERIOCK.EFFECTS.Common.heal",
  primary: simpleCommandFunctionFactory((a, o) => a.system.takeHeal(o)),
};

export default command;
