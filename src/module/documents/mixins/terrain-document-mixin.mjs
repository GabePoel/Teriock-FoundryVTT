/**
 * Mixin for documents that put tokens in terrains.
 * @template {MixinBase} T
 * @param {T} Base
 * @category Terrain
 */
export default function TerrainDocumentMixin(Base) {
  /** @mixin */
  class TerrainDocument extends Base {
    /**
     * Less specific terrains that don't apply to tokens.
     * @returns {Set<Teriock.Keys.Terrain>}
     */
    get removedTerrains() {
      const terrains = this.getFlag("teriock", "removedTerrains");
      return new Set(Array.isArray(terrains) ? terrains.filter(t => Object.hasOwn(TERIOCK.CONFIG.terrain, t)) : []);
    }

    /**
     * Terrains to apply to tokens.
     * @returns {Set<Teriock.Keys.Terrain>}
     */
    get terrains() {
      const terrains = this.getFlag("teriock", "terrains");
      return new Set(Array.isArray(terrains) ? terrains.filter(t => Object.hasOwn(TERIOCK.CONFIG.terrain, t)) : []);
    }

    /** @inheritDoc */
    _onUpdate(changed, options, userId) {
      const result = super._onUpdate(changed, options, userId);
      if (foundry.utils.hasProperty(changed, "flags.teriock")) {
        for (const token of this.tokens) { token.actor?.system.checkTerrains?.(); }
      }
      return result;
    }
  }

  return TerrainDocument;
}
