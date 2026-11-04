import { DocumentSelector } from "../../../applications/dialogs/_module.mjs";

/**
 * @import { ConstructionNode } from "../_module.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
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
     * @returns {Promise<ConstructionNode[]|null|false>}
     */
    async getNodes(options) {
      return DocumentSelector.selectMulti(this.rootNodes, {
        all: this.all,
        auto: this.auto,
        multi: this.all || this.multi,
        nullable: !this.multi,
        random: this.random,
        silent: true,
        ...options,
      });
    }
  }

  return ConstructNodesPseudoDocument;
}
