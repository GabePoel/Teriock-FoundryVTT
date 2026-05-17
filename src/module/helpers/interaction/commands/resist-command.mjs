import { icons } from "../../../constants/display/icons.mjs";
import { simpleCommandFunctionFactory, thresholdCommand } from "./abstract-command.mjs";

/** @type {Teriock.Interaction.SimpleCommandFunction<Teriock.Interaction.ResistOptions>} */
const use = simpleCommandFunctionFactory((a, o) => a.system.rollResistance(o));

/**
 * Resist command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  icon: icons.effect.resist,
  id: "resist",
  label: options => (options?.hex ? _loc("TERIOCK.ROLLS.Hexproof.button") : _loc("TERIOCK.ROLLS.Resist.button")),
  primary: use,
  secondary: use,
};

export default command;
