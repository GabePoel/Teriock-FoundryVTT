import { mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
import { WikiSystemMixin } from "../mixins/_module.mjs";
import { BasePageSystem } from "./abstract/_module.mjs";

/**
 * @extends {BasePageSystem}
 * @mixes WikiSystem
 */
export default class RuleSystem extends mixClasses(BasePageSystem, WikiSystemMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.document.core,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.rule,
    type: "rule",
  });

  /** @inheritDoc */
  get wikiIdentifier() {
    if (this.parent.parent?.uuid === TERIOCK.CONST.CONDITIONS_JOURNAL_UUID) { return `condition:${this.identifier}`; }
    return super.wikiIdentifier;
  }
}
