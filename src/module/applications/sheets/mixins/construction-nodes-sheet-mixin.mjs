/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * Mixin to support manipulating construction nodes in automations.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ConstructionNodesSheet>}
 */
export default function ConstructionNodesSheetMixin(Base) {
  /** @mixin */
  class ConstructionNodesSheet extends Base {
    /**
     * Create a construction node that's a child of another one.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onCreateConstructionNode(_event, target) {
      const parentMechanic = await fromUuid(target.dataset.parentUuid);
      if (!parentMechanic) { return; }
      await parentMechanic.createPseudoDocuments("ConstructionNode", [{ parentId: target.dataset.nodeId }]);
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = { actions: { createConstructionNode: this.#onCreateConstructionNode } };
  }

  return ConstructionNodesSheet;
}
