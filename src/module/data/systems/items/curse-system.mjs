import { mergeMetadata } from "../../../utils/_module.mjs";
import { SimpleItemSystem } from "./abstract/_module.mjs";

/**
 * Curse-specific item data model.
 * @extends {SimpleItemSystem}
 */
export default class CurseSystem extends SimpleItemSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.document.curse,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.curse,
    initialKind: "flaw",
    type: "curse",
  });

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(foundry.utils.mergeObject({ system: { powerSources: ["magical", "spiritual"] } }, data));
  }
}
