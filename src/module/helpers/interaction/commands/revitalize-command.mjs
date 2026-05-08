import { icons } from "../../../constants/display/icons.mjs";
import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

const command = {
  icon: icons.effect.revitalize,
  id: "revitalize",
  label: "TERIOCK.EFFECTS.Common.revitalize",
  primary: simpleCommandFunctionFactory((a, o) => a.system.takeRevitalize(o)),
};

export default command;
