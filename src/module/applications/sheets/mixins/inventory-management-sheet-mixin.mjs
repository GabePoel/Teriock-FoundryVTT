import { TeriockDragDrop } from "../../ux/_module.mjs";

/**
 * Mixin adding shared inventory drag-and-drop handling for sheets whose document is or belongs to an actor's inventory.
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function InventoryManagementSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class InventoryManagementSheet extends Base {
      /** @inheritDoc */
      _dropEffect(event) {
        const dropEffect = super._dropEffect(event);
        const actor = this.document.actor;
        if (dropEffect === "none" || !actor) { return dropEffect; }
        const document = TeriockDragDrop.payload?.document;
        if (
          document?.type === "equipment" && document.actor && document.isOwner
          && (document.actor === actor || !document.inCompendium)
        ) {
          return "move";
        }
        return dropEffect;
      }
    }
  );
}
