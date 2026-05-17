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
  icon: options => TERIOCK.config.attribute[options?.attribute]?.icon || "star",
  id: "feat",
  label: options =>
    TERIOCK.config.attribute[options?.attribute]?.label
      ? _loc("TERIOCK.ROLLS.Feat.name", {
          value: TERIOCK.config.attribute[options?.attribute]?.label,
        })
      : _loc("TERIOCK.ROLLS.Feat.label"),
  primary: use,
  secondary: use,
};

export default command;
