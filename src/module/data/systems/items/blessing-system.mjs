import { mergeMetadata } from "../../../utils/_module.mjs";
import { ContractItemSystem } from "./abstract/_module.mjs";

/**
 * Blessing-specific item data model.
 * @extends {ContractItemSystem}
 */
export default class BlessingSystem extends ContractItemSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.document.blessing,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.blessing,
    initialKind: "special",
    type: "blessing",
  });

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(foundry.utils.mergeObject({ system: { powerSources: ["divine"] } }, data));
  }
}
