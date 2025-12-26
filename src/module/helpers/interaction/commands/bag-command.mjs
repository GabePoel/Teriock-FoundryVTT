/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function primary(actor) {
  await actor.system.deathBagPull();
}

/**
 * Bag command
 * @type {Teriock.Interactions.CommandEntry}
 */
const command = {
  icon: "sack",
  id: "bag",
  label: "Pull from Death Bag",
  primary,
};

export default command;
