import { mergeMetadata } from "../../../../utils/_module.mjs";
import { SuppressionModel } from "../../../models/_module.mjs";
import BaseBehaviorSystem from "../base-behavior-system.mjs";

const { fields } = foundry.data;

export default class SuppressSystem extends BaseBehaviorSystem {
  /** @inheritDoc */
  static events = {
    [CONST.REGION_EVENTS.TOKEN_ENTER]: this._onTokenChange,
    [CONST.REGION_EVENTS.TOKEN_EXIT]: this._onTokenChange,
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

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if (!("system" in changed)) { return; }
    for (const actor of new Set(Array.from(this.region.tokens, t => t.actor).filter(Boolean))) {
      actor.reset();
      actor.render();
    }
  }
}
