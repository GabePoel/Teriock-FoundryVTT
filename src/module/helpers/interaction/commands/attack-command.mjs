/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.UseAbilityOptions} options
 * @returns {Promise<void>}
 */
async function primary(actor, options = {}) {
  await actor.useAbility("Basic Attack", options);
}

/**
 * Attack command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  icon: () => TERIOCK.options.document.ability.icon,
  id: "attack",
  label: "TERIOCK.COMMANDS.Attack.label",
  primary,
};

export default command;
