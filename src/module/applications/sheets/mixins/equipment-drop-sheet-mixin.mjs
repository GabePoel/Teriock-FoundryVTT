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
        let doc =
          /** @type {TeriockEquipment} */ await Cls.fromDropData(dropData);
        if (
          doc.type === "equipment" &&
          doc.actor &&
          (doc.elder?.type === "equipment" ||
            doc.elder?.documentName === "Actor") &&
          this.document.actor &&
          doc.checkAncestor(this.document.actor)
        ) {
          if (
            this.document.type === "equipment" &&
            this.document.system.storage.enabled
          ) {
            await doc.update({ "system._sup": this.document.id });
            return doc;
          } else if (this.document.documentName === "Actor") {
            await doc.update({ "system._sup": null });
            return doc;
          }
        }
        const created = await super._onDropChild(event, dropData);
        if (created?.type === "equipment") {
          const elder = await doc.getElder();
          if (
            doc.isOwner &&
            (elder?.type === "equipment" || elder?.documentName === "Actor") &&
            doc.uuid
          ) {
            await doc.delete();
          }
        }
        return created;
      }
    }
  );
}
