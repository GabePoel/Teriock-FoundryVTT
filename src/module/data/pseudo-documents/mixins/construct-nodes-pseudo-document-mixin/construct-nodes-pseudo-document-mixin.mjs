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
  /** @mixin */
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
     * @param {Teriock.Select.SelectDocumentsDialogOptions} options
     * @returns {Promise<ConstructionNode[]>}
     */
    async getNodes(options) {
      // TODO: This length/all handling can probably be moved into `DocumentSelector` directly.
      const nodes = this.rootNodes;
      if (nodes.length <= 1 || this.all) { return nodes; }
      return DocumentSelector.selectMulti(nodes, { auto: this.auto, multi: this.multi, silent: true, ...options });
    }
  }

  return ConstructNodesPseudoDocument;
}
