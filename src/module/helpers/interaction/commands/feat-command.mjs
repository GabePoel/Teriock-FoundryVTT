import { thresholdCommand } from "./abstract-command.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.FeatOptions} options
 */
async function use(actor, options = {}) {
  const attribute = options.attribute || "mov";
  await actor.system.rollFeatSave(attribute, options);
}

/**
 * Feat command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  args: ["attribute"],
  icon: (options) =>
    TERIOCK.options.attribute[options?.attribute]?.icon || "star",
  id: "feat",
  label: (options) =>
    TERIOCK.options.attribute[options?.attribute]?.label
      ? game.i18n.format("TERIOCK.ROLLS.Feat.name", {
          value: TERIOCK.options.attribute[options?.attribute]?.label,
        })
      : game.i18n.localize("TERIOCK.ROLLS.Feat.label"),
  primary: use,
  secondary: use,
};

export default command;
