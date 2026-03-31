/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.UseLocalOptions} options
 * @returns {Promise<void>}
 */
async function use(actor, options = {}) {
  await actor.useDocument("basic-attack", { ...options, type: "ability" });
}

/**
 * Attack command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  icon: () => TERIOCK.options.document.ability.icon,
  id: "attack",
  label: "TERIOCK.COMMANDS.Attack.label",
  primary: use,
  secondary: use,
};

export default command;
