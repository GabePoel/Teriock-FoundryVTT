import { mixClasses } from "../../../helpers/construction.mjs";
import { toCamelCase } from "../../../helpers/string.mjs";
import * as systemMixins from "../mixins/_module.mjs";
import BasePageSystem from "./base-page-system/base-page-system.mjs";

/**
 * @extends {BasePageSystem}
 * @extends {Teriock.Models.BasePageSystemData}
 * @mixes WikiSystem
 */
export default class RuleSystem extends mixClasses(BasePageSystem, systemMixins.WikiSystemMixin) {
  /** @inheritDoc */
  get wikiPage() {
    const namespace = this.parent.parent?.name ?? "";
    const indexKey = TERIOCK.config.wiki.namespaces[namespace]?.index;
    const index = indexKey ? TERIOCK.index[indexKey] : null;
    return `${namespace}:${index?.[toCamelCase(this.identifier ?? "")] ?? ""}`;
  }
}
