import { icons } from "../../../constants/display/_module.mjs";
import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

/**
 * Elder Sorcery command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  aliases: ["es"],
  icon: icons.manifest.ui.elderSorcery,
  id: "elderSorcery",
  label: "TERIOCK.EFFECTS.Common.elderSorcery",
  primary: simpleCommandFunctionFactory(a => a.system.createElderSorcery()),
};

export default command;
