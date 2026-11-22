import { mergeMetadata } from "../../../utils/_module.mjs";
import BaseBehaviorSystem from "./base-behavior-system.mjs";

/** @category Terrain */
export default class DifficultTerrainSystem extends BaseBehaviorSystem {
  /**
   * Recalculate movement paths when the region changes.
   * @param {RegionEvent} event
   * @this {DifficultTerrainSystem}
   */
  static async #onRegionEvent(event) {
    if (event.name === CONST.REGION_EVENTS.REGION_BOUNDARY && !this.behavior.viewed) { return; }
    canvas.tokens.recalculatePlannedMovementPaths();
  }

  /** @inheritDoc */
  static events = {
    [CONST.REGION_EVENTS.BEHAVIOR_UNVIEWED]: this.#onRegionEvent,
    [CONST.REGION_EVENTS.BEHAVIOR_VIEWED]: this.#onRegionEvent,
    [CONST.REGION_EVENTS.REGION_BOUNDARY]: this.#onRegionEvent,
    [CONST.REGION_EVENTS.TOKEN_ENTER]: this._onTokenEvent,
    [CONST.REGION_EVENTS.TOKEN_EXIT]: this._onTokenEvent,
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
