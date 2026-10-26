const { CompendiumCollection } = foundry.documents.collections;

/**
 * Cursed monkey patch so that subs don't get duplicated by the batched import process.
 * @category Hierarchy
 */
const importAll = CompendiumCollection.prototype.importAll;
CompendiumCollection.prototype.importAll = function(options = {}) {
  return importAll.call(this, { ...options, dropSubs: true });
};

export default CompendiumCollection;
