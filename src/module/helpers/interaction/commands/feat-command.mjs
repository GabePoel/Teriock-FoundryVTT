import { simpleCommandFunctionFactory, thresholdCommand } from "./abstract-command.mjs";

/** @type {Teriock.Command.SimpleCommandFunction<Teriock.Command.FeatOptions>} */
const use = simpleCommandFunctionFactory((a, o) => a.system.rollFeatSave(o.attribute ?? "mov", o));

/**
 * Feat command
 * @type {Teriock.Command.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  args: ["attribute"],
  id: "feat",
  primary: use,
  secondary: use,
  icon: options => TERIOCK.config.attribute[options?.attribute]?.icon || "star",
  label: options => TERIOCK.config.attribute[options?.attribute]?.label
    ? _loc("TERIOCK.ROLLS.Feat.name", { value: TERIOCK.config.attribute[options?.attribute]?.label })
    : _loc("TERIOCK.ROLLS.Feat.label"),
};

export default command;
