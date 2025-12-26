/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function primary(actor) {
  await actor.system.takeAwaken();
}

/**
 * Awaken command
 * @type {Teriock.Interactions.CommandEntry}
 */
const command = {
  icon: "sunrise",
  id: "awaken",
  label: "Awaken",
  primary,
};

export default command;
