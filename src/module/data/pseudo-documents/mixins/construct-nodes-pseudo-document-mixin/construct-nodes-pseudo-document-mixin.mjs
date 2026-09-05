import { DocumentSelector } from "../../../../applications/dialogs/_module.mjs";

/**
 * @import { ConstructionNode } from "../../_module.mjs";
 */

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ConstructNodesPseudoDocument>}
 */
export default function ConstructNodesPseudoDocumentMixin(Base) {
  /**
   * @mixin
   */
  class ConstructNodesPseudoDocument extends Base {
    /**
     * The root nodes.
     * @returns {ConstructionNode[]}
     */
    get rootNodes() {
      return this.constructionNodes.filter(n => !n.parentNode);
    }

    /**
     * Get the construction nodes to build with.
     * @param {object} options
     * @returns {Promise<ConstructionNode[]>}
     */
    async getNodes(options) {
      let nodes = this.rootNodes;
      if (this.selectInExecution) {
        if (!this.all) {
          nodes = await DocumentSelector.selectMulti(nodes, { auto: this.auto, multi: this.multi, silent: true });
        }
        nodes = await Promise.all(nodes.map(n => n.getDeterministicCopy(options)));
      }
      return nodes;
    }
  }

  return ConstructNodesPseudoDocument;
}
