import { mergeMetadata } from "../../../../utils/_module.mjs";
import { terrainSchema } from "../../../fields/tools/builders.mjs";
import BaseBehaviorSystem from "../base-behavior-system.mjs";

/** @category Terrain */
export default class TerrainSystem extends BaseBehaviorSystem {
  /** @inheritDoc */
  static events = {
    [CONST.REGION_EVENTS.TOKEN_ENTER]: this._onTokenChange,
    [CONST.REGION_EVENTS.TOKEN_EXIT]: this._onTokenChange,
  };

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { icon: TERIOCK.DISPLAY.icons.manifest.ui.terrain, type: "terrain" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), terrainSchema());
  }

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if (!("system" in changed)) { return; }
    for (const token of this.region.tokens) { token.actor?.system.checkSurroundings?.(); }
  }
}
