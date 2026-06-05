import { icons } from "../../../constants/display/icons.mjs";
import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

/**
 * Long rest command
 * @type {Teriock.Command.CommandEntry}
 */
export const longRestCommand = {
  aliases: ["lr"],
  icon: icons.ui.longRest,
  id: "longRest",
  label: "TERIOCK.SHEETS.Actor.ACTIONS.TakeLongRest.label",
  primary: simpleCommandFunctionFactory(a => a.system.takeLongRest()),
};

/**
 * Short rest command
 * @type {Teriock.Command.CommandEntry}
 */
export const shortRestCommand = {
  aliases: ["sr"],
  icon: icons.ui.shortRest,
  id: "shortRest",
  label: "TERIOCK.SHEETS.Actor.ACTIONS.TakeShortRest.label",
  primary: simpleCommandFunctionFactory(a => a.system.takeShortRest()),
};
