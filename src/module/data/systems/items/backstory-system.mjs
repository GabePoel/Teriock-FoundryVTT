import { mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
import { ArmorSuppressionSystemMixin } from "../mixins/_module.mjs";
import { SimpleItemSystem } from "./abstract/_module.mjs";

/**
 * Backstory-specific item data model.
 * @extends {SimpleItemSystem}
 * @mixes ArmorSuppressionSystem
 */
export default class BackstorySystem extends mixClasses(SimpleItemSystem, ArmorSuppressionSystemMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.document.backstory,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.backstory,
    initialCompetence: 1,
    initialKind: "other",
    type: "backstory",
  });

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(foundry.utils.mergeObject({ system: { powerSources: ["martial"] } }, data));
  }
}
