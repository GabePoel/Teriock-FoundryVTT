import { icons } from "../../../constants/display/_module.mjs";
import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

/**
 * Heal command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  icon: icons.manifest.effect.heal,
  id: "heal",
  label: "TERIOCK.EFFECTS.Common.heal",
  primary: simpleCommandFunctionFactory((a, o) => a.system.takeHeal(o)),
};

export default command;
