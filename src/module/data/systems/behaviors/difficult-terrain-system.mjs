import { mergeMetadata } from "../../../utils/_module.mjs";
import BaseBehaviorSystem from "./base-behavior-system.mjs";

/** @category Terrain */
export default class DifficultTerrainSystem extends BaseBehaviorSystem {
  /**
   * Recalculate movement paths when the region changes.
   * @param {RegionEvent} event
   * @this {DifficultTerrainSystem}
   */
  static async #onRegionChange(event) {
    if (event.name === CONST.REGION_EVENTS.REGION_BOUNDARY && !this.behavior.viewed) { return; }
    canvas.tokens.recalculatePlannedMovementPaths();
  }

  /** @inheritDoc */
  static events = {
    [CONST.REGION_EVENTS.BEHAVIOR_UNVIEWED]: this.#onRegionChange,
    [CONST.REGION_EVENTS.BEHAVIOR_VIEWED]: this.#onRegionChange,
    [CONST.REGION_EVENTS.REGION_BOUNDARY]: this.#onRegionChange,
    [CONST.REGION_EVENTS.TOKEN_ENTER]: this._onTokenChange,
    [CONST.REGION_EVENTS.TOKEN_EXIT]: this._onTokenChange,
  };

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.movement.difficultTerrain,
    type: "difficultTerrain",
  });

  /** @inheritDoc */
  _getTerrainEffects(token, _segment, _options) {
    if (!this.behavior.checkQualifier(token)) { return []; }
    return [{ name: "difficultTerrain" }];
  }
}
