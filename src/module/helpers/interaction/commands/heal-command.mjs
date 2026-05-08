import { icons } from "../../../constants/display/icons.mjs";
import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

const command = {
  icon: icons.effect.heal,
  id: "heal",
  label: "TERIOCK.EFFECTS.Common.heal",
  primary: simpleCommandFunctionFactory((a, o) => a.system.takeHeal(o)),
};

export default command;
