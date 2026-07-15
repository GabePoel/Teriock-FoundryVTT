import affinityConfig from "../../../constants/config/affinity-config.mjs";
import { icons } from "../../../constants/display/icons.mjs";
import { simpleCommandFunctionFactory, thresholdCommand } from "./abstract-command.mjs";

/** @type {Teriock.Command.SimpleCommandFunction<Teriock.Command.ResistOptions>} */
const use = simpleCommandFunctionFactory((a, o) => a.system.rollAffinity(o?.type ?? "resistance", o));

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
  label: options => _loc(affinityConfig.types[options?.type ?? "resistance"].button),
};

export default command;
