import { icons } from "../../../constants/display/_module.mjs";
import { mergeMetadata, mixClasses } from "../../../helpers/construction.mjs";
import { WikiSystemMixin } from "../mixins/_module.mjs";
import BasePageSystem from "./base-page-system/base-page-system.mjs";

/**
 * @mixes WikiSystem
 */
export default class RuleSystem extends mixClasses(BasePageSystem, WikiSystemMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { icon: icons.manifest.document.core, type: "rule" });

  /**
   * @inheritDoc
   * @returns {TypedIdentifier|null}
   */
  get wikiIdentifier() {
    const type = this.parent.parent?.name?.toLowerCase();
    if (!TERIOCK.config.wiki.index[type] || !this.identifier) { return null; }
    return `${type}:${this.identifier}`;
  }
}
