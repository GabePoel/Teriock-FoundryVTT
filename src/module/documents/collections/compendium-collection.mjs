const { CompendiumCollection } = foundry.documents.collections;

/**
 * Cursed monkey patch so that subs don't get duplicated by the batched import process.
 * @category Hierarchy
 */
const importAll = CompendiumCollection.prototype.importAll;
CompendiumCollection.prototype.importAll = function(options = {}) {
  return importAll.call(this, { ...options, dropSubs: true });
};

/**
 * Untrack a deleted pack's documents.
 */
const deleteCompendium = CompendiumCollection.prototype.deleteCompendium;
CompendiumCollection.prototype.deleteCompendium = async function() {
  const pack = await deleteCompendium.call(this);
  game.teriock.identifiers.untrackCompendium(pack);
  return pack;
};

export default CompendiumCollection;
