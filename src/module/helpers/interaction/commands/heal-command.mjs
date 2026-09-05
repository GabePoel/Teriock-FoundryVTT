import { icons } from "../../../constants/display/_module.mjs";
import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

const command = {
  icon: icons.manifest.effect.heal,
  id: "heal",
  label: "TERIOCK.EFFECTS.Common.heal",
  primary: simpleCommandFunctionFactory((a, o) => a.system.takeHeal(o)),
};

export default command;
