import { icons } from "../../../constants/display/icons.mjs";
import { simpleCommandFunctionFactory, thresholdCommand } from "./abstract-command.mjs";

/** @type {Teriock.Command.SimpleCommandFunction<Teriock.Command.ResistOptions>} */
const use = simpleCommandFunctionFactory((a, o) => a.system.rollResistance(o));

/**
 * Resist command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  icon: icons.effect.resist,
  id: "resist",
  primary: use,
  secondary: use,
  label: options => (options?.hex ? _loc("TERIOCK.ROLLS.Hexproof.button") : _loc("TERIOCK.ROLLS.Resist.button")),
};

export default command;
