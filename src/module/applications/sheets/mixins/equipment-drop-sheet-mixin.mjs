import { resolveDocument } from "../../../helpers/resolve.mjs";

/**
 * Mixin that handles {@link TeriockEquipment} dropping between actors and other equipment in a way that preserves
 * {@link TeriockAttunement} links.
 * @param {typeof DragDropCommonSheetPart} Base
 */
export default function EquipmentDropSheetMixin(Base) {
  return (
    /**
     * @extends {DragDropCommonSheetPart}
     * @mixes DragDropCommonSheetPart
     * @mixin
     * @property {TeriockEquipment} document
     */
    class EquipmentDropSheet extends Base {
      /** @inheritDoc */
      async _onDropChild(event, dropData) {
        /** @type {typeof ClientDocument} */
        const Cls = foundry.utils.getDocumentClass(dropData.type);
        const doc = /** @type {TeriockEquipment} */ await Cls.fromDropData(dropData);

        // Throw error if storage isn't enabled
        if (doc.type === "equipment" && this.document.type === "equipment" && !this.document.system.storage.enabled) {
          ui.notifications.error("TERIOCK.SHEETS.Equipment.NOTIFICATIONS.notStorage", {
            format: { name: this.document.name },
            localize: true,
          });
          return;
        }

        if (doc.type === "equipment" && doc.actor && !doc.isOwner) return;

        // Create reference to old elder
        const _elder = doc.elder;

        // Optionally stack equipment
        let stack = false;
        if (doc.type === "equipment") stack = await this._stackEquipment(doc);

        // Handle moving equipment around within inventory instead of duplicating it
        if (
          doc.type === "equipment"
          && doc.actor
          && (_elder?.type === "equipment" || _elder?.documentName === "Actor")
          && this.document.actor
          && doc.checkAncestor(this.document.actor)
        ) {
          const oldElder = await resolveDocument(_elder);
          if (stack) {
            await doc.delete();
            if (oldElder) await oldElder.sheet?.render();
            return stack;
          } else if (this.document.type === "equipment" && this.document.system.storage.enabled) {
            await doc.update({ "system._sup": this.document.id });
            if (oldElder) await oldElder.sheet?.render();
            return doc;
          } else if (this.document.documentName === "Actor") {
            await doc.update({ "system._sup": null });
            if (oldElder) await oldElder.sheet?.render();
            return doc;
          }
        }

        if (stack) {
          if (doc.isOwner) await doc.delete();
          return stack;
        }

        // Run normal drop routine
        const created = await super._onDropChild(event, dropData);

        // Delete old equipment if it was moved instead of duplicated
        if (created?.type === "equipment") {
          const elder = await doc.getElder();
          if (doc.isOwner && (elder?.type === "equipment" || elder?.documentName === "Actor") && doc.uuid)
            await doc.delete();
        }
        return created;
      }
    }
  );
}
