import { mergeMetadata } from "../../../utils/_module.mjs";
import { SimpleItemSystem } from "./abstract/_module.mjs";

/**
 * Scar-specific item data model.
 * @extends {SimpleItemSystem}
 */
export default class ScarSystem extends SimpleItemSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.document.scar,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.scar,
    initialKind: "flaw",
    type: "scar",
  });

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(foundry.utils.mergeObject({ system: { powerSources: ["unknown"] } }, data));
  }
}
