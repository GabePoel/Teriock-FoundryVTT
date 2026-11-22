import { mergeMetadata } from "../../../../utils/_module.mjs";
import { SuppressionModel } from "../../../models/_module.mjs";
import BaseBehaviorSystem from "../base-behavior-system.mjs";

const { fields } = foundry.data;

export default class SuppressSystem extends BaseBehaviorSystem {
  /** @inheritDoc */
  static events = {
    [CONST.REGION_EVENTS.TOKEN_ENTER]: this._onTokenEvent,
    [CONST.REGION_EVENTS.TOKEN_EXIT]: this._onTokenEvent,
  };

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.ui.suppression,
    type: "suppress",
  });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { suppression: new fields.EmbeddedDataField(SuppressionModel) });
  }
}
