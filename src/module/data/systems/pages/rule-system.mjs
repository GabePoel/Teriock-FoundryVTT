import { icons, thumbnails } from "../../../static/display/_module.mjs";
import { mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
import { WikiSystemMixin } from "../mixins/_module.mjs";
import BasePageSystem from "./base-page-system/base-page-system.mjs";

/**
 * @extends {BasePageSystem}
 * @mixes WikiSystem
 */
export default class RuleSystem extends mixClasses(BasePageSystem, WikiSystemMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: icons.manifest.document.core,
    img: thumbnails.manifest.document.rule,
    type: "rule",
  });

  /**
   * @inheritDoc
   * @returns {TypedIdentifier|null}
   */
  get wikiIdentifier() {
    const type = this.parent.parent?.name?.toLowerCase();
    if (!TERIOCK.CONFIG.wiki.index[type] || !this.identifier) { return null; }
    return `${type}:${this.identifier}`;
  }
}
