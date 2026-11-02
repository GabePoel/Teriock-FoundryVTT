import { mergeMetadata } from "../../../../utils/_module.mjs";
import { terrainSchema } from "../../../fields/tools/builders.mjs";
import BaseBehaviorSystem from "../base-behavior-system.mjs";

/** @category Terrain */
export default class TerrainSystem extends BaseBehaviorSystem {
  /**
   * Recalculate movement paths when the terrain data gets changed.
   * @param {RegionEvent} event
   * @this {TerrainSystem}
   */
  static async #onTerrainChange(event) {
    if (event.name === CONST.REGION_EVENTS.REGION_BOUNDARY && !this.behavior.viewed) { return; }
    canvas.tokens.recalculatePlannedMovementPaths();
  }

  /**
   * Reset actors whose token terrains have changed.
   * @param {RegionEvent} event
   */
  static async #onTokenTerrainChange(event) {
    event.data.token.actor?.system.checkTerrains?.();
  }

  /** @inheritDoc */
  static events = {
    [CONST.REGION_EVENTS.BEHAVIOR_UNVIEWED]: this.#onTerrainChange,
    [CONST.REGION_EVENTS.BEHAVIOR_VIEWED]: this.#onTerrainChange,
    [CONST.REGION_EVENTS.REGION_BOUNDARY]: this.#onTerrainChange,
    [CONST.REGION_EVENTS.TOKEN_ENTER]: this.#onTokenTerrainChange,
    [CONST.REGION_EVENTS.TOKEN_EXIT]: this.#onTokenTerrainChange,
  };

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.movement.difficultTerrain,
    type: "terrain",
  });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), terrainSchema());
  }

  /**
   * @inheritDoc
   * @template TerrainEffect
   * @returns {TerrainEffect[]}
   */
  _getTerrainEffects(_token, _segment, _options) {
    if (!this.difficultTerrain && !this.terrains.size) { return []; }
    return [{ difficultTerrain: this.difficultTerrain, name: "terrain", terrains: this.terrains }];
  }

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if (!("system" in changed)) { return; }
    if (this.behavior.viewed) { canvas.tokens.recalculatePlannedMovementPaths(); }
    for (const token of this.region.tokens) { token.actor?.system.checkTerrains?.(); }
  }
}
