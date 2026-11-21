const { fields } = foundry.data;
const { TerrainData } = foundry.data;

/**
 * Extended to allow for difficult terrain.
 * @category Terrain
 */
export default class TeriockTerrainData extends TerrainData {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { difficultTerrain: new fields.BooleanField() });
  }

  /** @inheritDoc */
  static resolveTerrainEffects(effects, options) {
    const difficultTerrain = effects.some(e => e.name === "difficultTerrain");
    const data = super.resolveTerrainEffects(effects, options);
    if (!data && !difficultTerrain) { return null; }
    const terrain = data ?? new this();
    terrain.updateSource({ difficultTerrain });
    return terrain;
  }

  /** @inheritDoc */
  equals(other) {
    return super.equals(other) && this.difficultTerrain === other.difficultTerrain;
  }
}
