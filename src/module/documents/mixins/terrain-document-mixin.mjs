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
     * How this changes less specific terrains.
     * @returns {Teriock.Keys.TerrainMode}
     */
    get terrainMode() {
      const mode = this.getFlag("teriock", "terrainMode");
      return Object.hasOwn(TERIOCK.CONFIG.terrain.modes, mode) ? mode : "add";
    }

    /**
     * Terrains to change.
     * @returns {Set<Teriock.Keys.Terrain>}
     */
    get terrains() {
      const terrains = this.getFlag("teriock", "terrains");
      return new Set(
        Array.isArray(terrains) ? terrains.filter(t => Object.hasOwn(TERIOCK.CONFIG.terrain.terrains, t)) : [],
      );
    }

    /** @inheritDoc */
    _onUpdate(changed, options, userId) {
      const result = super._onUpdate(changed, options, userId);
      if (foundry.utils.hasProperty(changed, "flags.teriock")) {
        for (const token of this.tokens) { token.actor?.system.checkSurroundings?.(); }
      }
      return result;
    }
  }

  return TerrainDocument;
}
