const { fields } = foundry.data;
const { TerrainData } = foundry.data;

/**
 * Extended to allow for difficult terrain and terrain types.
 */
export default class TeriockTerrainData extends TerrainData {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      difficultTerrain: new fields.BooleanField(),
      terrains: new fields.SetField(new fields.StringField()),
    });
  }

  /** @inheritDoc */
  static resolveTerrainEffects(effects, options) {
    const terrainEffects = effects.filter(e => e.name === "terrain");
    const difficultTerrain = terrainEffects.some(e => e.difficultTerrain);
    const terrains = new Set(terrainEffects.flatMap(e => Array.from(e.terrains)));
    const data = super.resolveTerrainEffects(effects, options);
    if (!data && !difficultTerrain && !terrains.size) { return null; }
    const terrain = data ?? new this();
    terrain.updateSource({ difficultTerrain, terrains: Array.from(terrains) });
    return terrain;
  }

  /** @inheritDoc */
  equals(other) {
    return super.equals(other) && this.difficultTerrain === other.difficultTerrain
      && this.terrains.equals(other.terrains);
  }
}
