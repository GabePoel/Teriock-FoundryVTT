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
 * Reset the identifiers registry once a deleted pack is gone from `game.packs`.
 */
const deleteCompendium = CompendiumCollection.prototype.deleteCompendium;
CompendiumCollection.prototype.deleteCompendium = async function() {
  const pack = await deleteCompendium.call(this);
  if (game.teriock.identifiers.documentNames.has(pack.documentName)) { game.teriock.identifiers.reset(); }
  return pack;
};

export default CompendiumCollection;
