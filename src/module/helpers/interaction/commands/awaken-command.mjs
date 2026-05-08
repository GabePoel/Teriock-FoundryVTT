import { icons } from "../../../constants/display/icons.mjs";
import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

/**
 * Awaken command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  icon: icons.effect.awaken,
  id: "awaken",
  label: "TERIOCK.EFFECTS.Common.awaken",
  primary: simpleCommandFunctionFactory((a) => a.system.takeAwaken()),
};

export default command;
