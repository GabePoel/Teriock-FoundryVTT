import { mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
import { ArmorSuppressionSystemMixin } from "../mixins/_module.mjs";
import { SimpleItemSystem } from "./abstract/_module.mjs";

/**
 * Blessing-specific item data model.
 * @extends {SimpleItemSystem}
 * @mixes ArmorSuppressionSystem
 */
export default class BlessingSystem extends mixClasses(SimpleItemSystem, ArmorSuppressionSystemMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.document.blessing,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.blessing,
    initialKind: "special",
    kinds: _replace({ special: TERIOCK.CONFIG.effect.kind.special, ...TERIOCK.CONFIG.system.defaultKinds }),
    type: "blessing",
  });

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(
      foundry.utils.mergeObject({ system: { effectTypes: ["contract"], powerSources: ["divine"] } }, data),
    );
  }
}
