/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function primary(actor) {
  await actor.system.takeHeal();
}

const command = {
  icon: "hand-holding-heart",
  id: "heal",
  label: "Heal",
  primary,
};

export default command;
