/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interactions.UseAbilityOptions} options
 * @returns {Promise<void>}
 */
async function primary(actor, options = {}) {
  await actor.useAbility("Basic Attack", options);
}

/**
 * Attack command
 * @type {Teriock.Interactions.CommandEntry}
 */
const command = {
  icon: () => TERIOCK.options.document.ability.icon,
  id: "attack",
  label: "Attack",
  primary,
};

export default command;
