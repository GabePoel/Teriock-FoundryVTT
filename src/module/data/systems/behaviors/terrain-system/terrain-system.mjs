import { mergeMetadata } from "../../../../utils/_module.mjs";
import { terrainSchema } from "../../../fields/tools/builders.mjs";
import BaseBehaviorSystem from "../base-behavior-system.mjs";

/** @category Terrain */
export default class TerrainSystem extends BaseBehaviorSystem {
  /** @inheritDoc */
  static events = {
    [CONST.REGION_EVENTS.TOKEN_ENTER]: this._onTokenEvent,
    [CONST.REGION_EVENTS.TOKEN_EXIT]: this._onTokenEvent,
  };

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { icon: TERIOCK.DISPLAY.icons.manifest.ui.terrain, type: "terrain" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), terrainSchema());
  }
}
