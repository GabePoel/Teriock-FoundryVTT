import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { RegionDocument } = foundry.documents;

/**
 * @extends {RegionDocument}
 * @mixes BaseDocument
 */
export default class TeriockRegionDocument extends mixClasses(RegionDocument, BaseDocumentMixin) {
  /**
   * Get active behaviors that are qualified for a given token.
   * @param {string} type
   * @param {TeriockTokenDocument} token
   * @returns {TeriockRegionBehavior[]}
   */
  getQualifiedBehaviors(type, token) {
    return (this.behaviors.documentsByType[type] ?? []).filter(b => b.active && b.checkQualifier(token));
  }
}
