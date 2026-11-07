/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * Sheet part to support manipulating construction nodes in automations.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function MechanicsSheetConstructionNodesPart(Base) {
  /** @mixin */
  class MechanicsSheetConstructionNodesPart extends Base {
    /**
     * Create a construction node that's a child of another one.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onCreateConstructionNode(_event, target) {
      const parentMechanic = await fromUuid(target.dataset.parentUuid);
      if (!parentMechanic) { return; }
      const nodes = parentMechanic.getEmbeddedCollection("ConstructionNode");
      const sort = Math.max(0, ...nodes.map(n => n.sort)) + CONST.SORT_INTEGER_DENSITY;
      await parentMechanic.createPseudoDocuments("ConstructionNode", [{ parentId: target.dataset.nodeId, sort }]);
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = { actions: { createConstructionNode: this.#onCreateConstructionNode } };
  }

  return MechanicsSheetConstructionNodesPart;
}
