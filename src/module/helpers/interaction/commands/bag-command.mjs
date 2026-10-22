import { simpleCommandFunctionFactory } from "./abstract-command.mjs";

/**
 * Bag command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  icon: TERIOCK.DISPLAY.icons.manifest.execution.deathBag,
  id: "bag",
  label: "TERIOCK.EFFECTS.Common.bag",
  primary: simpleCommandFunctionFactory(a => a.system.deathBagPull()),
};

export default command;
