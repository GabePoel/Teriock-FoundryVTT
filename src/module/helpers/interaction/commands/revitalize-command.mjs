/**
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
async function primary(actor) {
  await actor.system.takeRevitalize();
}

const command = {
  icon: "hand-holding-droplet",
  id: "revitalize",
  label: "Revitalize",
  primary,
};

export default command;
