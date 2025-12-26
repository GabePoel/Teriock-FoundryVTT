import { thresholdCommand } from "./abstract-command.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interactions.FeatOptions} options
 */
async function primary(actor, options = {}) {
  const attribute = options.attribute || "mov";
  await actor.system.rollFeatSave(attribute, options);
}

/**
 * Feat command
 * @type {Teriock.Interactions.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  args: ["attribute"],
  primary,
  label: "Feat Save",
  icon: "star",
  id: "feat",
};

export default command;
