import { icons } from "../../../constants/display/icons.mjs";
import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

/**
 * Awaken command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  icon: icons.effect.revive,
  id: "revive",
  label: "TERIOCK.EFFECTS.Common.revive",
  primary: simpleCommandFunctionFactory((a) => a.system.takeRevive()),
};

export default command;
