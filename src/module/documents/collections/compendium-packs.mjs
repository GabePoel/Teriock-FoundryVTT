const { CompendiumPacks } = foundry.documents.collections;

/**
 * Untrack a deleted pack's documents.
 * @category Identifiers
 */
const deletePack = CompendiumPacks.prototype.delete;
CompendiumPacks.prototype.delete = function(key) {
  const pack = this.get(key);
  if (pack) { game.teriock.identifiers.untrackCompendium(pack); }
  return deletePack.call(this, key);
};

export default CompendiumPacks;
