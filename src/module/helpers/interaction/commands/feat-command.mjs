import { thresholdCommand } from "./abstract-command.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.FeatOptions} options
 */
async function primary(actor, options = {}) {
  options.showDialog = game.settings.get("teriock", "showRollDialogs");
  const attribute = options.attribute || "mov";
  await actor.system.rollFeatSave(attribute, options);
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.FeatOptions} options
 */
async function secondary(actor, options = {}) {
  options.showDialog = !game.settings.get("teriock", "showRollDialogs");
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
  primary,
  secondary,
};

export default command;
