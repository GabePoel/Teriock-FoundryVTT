import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

/**
 * Revitalize command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  icon: TERIOCK.DISPLAY.icons.manifest.effect.revitalize,
  id: "revitalize",
  label: "TERIOCK.EFFECTS.Common.revitalize",
  primary: simpleCommandFunctionFactory((a, o) => a.system.takeRevitalize(o)),
};

export default command;
