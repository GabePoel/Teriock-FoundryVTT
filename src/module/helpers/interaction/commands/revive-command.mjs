/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function primary(actor) {
  await actor.system.takeRevive();
}

/**
 * Awaken command
 * @type {Teriock.Interactions.CommandEntry}
 */
const command = {
  icon: "heart-pulse",
  id: "revive",
  label: "Revive",
  primary,
};

export default command;
