import { thresholdCommand } from "./abstract-command.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.UseAbilityOptions} options
 * @returns {Promise<void>}
 */
async function primary(actor, options = {}) {
  const abilityName = options.ability;
  if (!abilityName) {
    ui.notifications.warn("No ability name provided.");
    return;
  }
  await actor.useAbility(
    abilityName,
    Object.assign(options, {
      showDialog: game.settings.get("teriock", "showRollDialogs"),
    }),
  );
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.UseAbilityOptions} options
 * @returns {Promise<void>}
 */
async function secondary(actor, options = {}) {
  const abilityName = options.ability;
  if (!abilityName) {
    ui.notifications.warn("No ability name provided.");
    return;
  }
  await actor.useAbility(
    abilityName,
    Object.assign(options, {
      showDialog: !game.settings.get("teriock", "showRollDialogs"),
    }),
  );
}

/**
 * Use ability command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  aliases: ["use"],
  args: ["ability"],
  icon: () => TERIOCK.options.document.ability.icon,
  id: "useAbility",
  label: (options) =>
    options?.ability ? `Use ${options.ability}` : "Use Ability",
  primary,
  secondary,
};

export default command;
