import { simpleCommandFunctionFactory, thresholdCommand } from "./abstract-command.mjs";

/** @type {Teriock.Command.SimpleCommandFunction<Teriock.Command.ResistOptions>} */
const use = simpleCommandFunctionFactory((a, o) => a.system.rollAffinity(o?.type ?? "resistance", o));

/**
 * Resist command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  icon: TERIOCK.DISPLAY.icons.manifest.effect.resist,
  id: "resist",
  primary: use,
  secondary: use,
  label: options => _loc(TERIOCK.CONFIG.affinity.types[options?.type ?? "resistance"].button),
};

export default command;
