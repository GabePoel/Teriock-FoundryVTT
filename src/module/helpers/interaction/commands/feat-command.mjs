import { simpleCommandFunctionFactory, thresholdCommand } from "./abstract-command.mjs";

/** @type {Teriock.Interaction.SimpleCommandFunction<Teriock.Interaction.FeatOptions>} */
const use = simpleCommandFunctionFactory((a, o) => a.system.rollFeatSave(o.attribute ?? "mov", o));

/**
 * Feat command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  args: ["attribute"],
  id: "feat",
  primary: use,
  secondary: use,
  icon: options => TERIOCK.config.attribute[options?.attribute]?.icon || "star",
  label: options =>
    TERIOCK.config.attribute[options?.attribute]?.label
      ? _loc("TERIOCK.ROLLS.Feat.name", {
          value: TERIOCK.config.attribute[options?.attribute]?.label,
        })
      : _loc("TERIOCK.ROLLS.Feat.label"),
};

export default command;
