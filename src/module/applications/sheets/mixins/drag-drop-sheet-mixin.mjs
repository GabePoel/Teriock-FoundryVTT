import { DragDropApplicationMixin } from "../../api/mixins/_module.mjs";
import { TeriockDragDrop, TeriockTextEditor } from "../../ux/_module.mjs";

const CHILD_DOCUMENT_TYPES = ["ActiveEffect", "Actor", "Item"];
const DROP_TARGET_CLASS = "teriock-drop-target";

/**
 * Mixin adding drag-and-drop handling to sheets.
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function DragDropSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixes DragDropApplication
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class DragDropSheet extends DragDropApplicationMixin(Base) {
      /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = { teriock: { maximizeOnDragEnter: true, minimizeOnDragStart: true } };

      /**
       * Whether a drop should be performed by moving a sub.
       * @param {AnyCommonDocument} droppedDocument
       * @param {Teriock.Application.DropEffect} dropEffect
       * @returns {boolean}
       */
      #isSubMove(droppedDocument, dropEffect) {
        if (dropEffect !== "move" || !droppedDocument.documentMetadata?.hierarchy) { return false; }
        if (this.#subMoveTarget(droppedDocument) === (droppedDocument.system._sup || null)) { return false; }
        if (droppedDocument.documentName === this.document.documentName) {
          return droppedDocument.parent === this.document.parent && droppedDocument.pack === this.document.pack;
        }
        return droppedDocument.parent === this.document;
      }

      /**
       * Moves a sub.
       * @param {AnyCommonDocument} droppedDocument
       * @param {boolean} interactive
       * @returns {Promise<void>}
       */
      async #onMoveSub(droppedDocument, interactive) {
        await foundry.documents.modifyBatch([{
          action: "update",
          documentName: droppedDocument.documentName,
          interactive,
          notifyOnFailure: true,
          pack: droppedDocument.pack,
          parent: droppedDocument.parent,
          updates: [{ _id: droppedDocument.id, "system._sup": this.#subMoveTarget(droppedDocument) }],
        }]);
      }

      /**
       * The sup a dropped document would be given by a sub move.
       * @param {AnyCommonDocument} droppedDocument
       * @returns {ID<AnyCommonDocument>|null}
       */
      #subMoveTarget(droppedDocument) {
        return droppedDocument.documentName === this.document.documentName ? this.document.id : null;
      }

      /**
       * What gets marked as where a drop would land.
       * @returns {HTMLElement|null}
       */
      get _dropTargetElement() {
        return this.window.content;
      }

      /**
       * Checks if some other document can be dropped on this document.
       * @param {AnyCommonDocument} droppedDocument
       * @param {Teriock.Application.DropEffect} [dropEffect]
       * @returns {boolean}
       */
      _canDropChild(droppedDocument, dropEffect = "copy") {
        if (!droppedDocument || droppedDocument === this.document) { return false; }
        if (!this._checkChildDropEditable(droppedDocument, dropEffect)) {
          ui.notifications.error("TERIOCK.DIALOGS.Common.ERRORS.notEditable", { localize: true });
          return false;
        }
        if (!this._checkChildDropType(droppedDocument, dropEffect)) { return false; }
        if (!this._checkChildDropViewer(droppedDocument, dropEffect)) { return false; }
        if (!this._checkChildDropMove(droppedDocument, dropEffect)) { return false; }
        if (droppedDocument.parent === this.document) { return this.#isSubMove(droppedDocument, dropEffect); }
        return true;
      }

      /**
       * Checks if a child document is blocked from being dropped on this document because this isn't editable.
       * Evaluated on every drag over event, so it must not notify.
       * @param {AnyCommonDocument} _droppedDocument
       * @param {Teriock.Application.DropEffect} _dropEffect
       * @returns {boolean}
       */
      _checkChildDropEditable(_droppedDocument, _dropEffect) {
        return this.isEditable;
      }

      /**
       * Checks if a child document is blocked from being dropped on this document because its being moved and the user
       * has insufficient permissions to delete the original child document.
       * @param {AnyCommonDocument} droppedDocument
       * @param {Teriock.Application.DropEffect} dropEffect
       * @returns {boolean}
       */
      _checkChildDropMove(droppedDocument, dropEffect) {
        if (dropEffect === "move" && !droppedDocument.isOwner) {
          ui.notifications.error("TERIOCK.SHEETS.Common.NOTIFICATIONS.cantDropMove");
          return false;
        }
        return true;
      }

      /**
       * Checks if a child document is blocked from being dropped on this document because of its type.
       * @param {AnyCommonDocument} droppedDocument
       * @param {Teriock.Application.DropEffect} _dropEffect
       * @returns {boolean}
       */
      _checkChildDropType(droppedDocument, _dropEffect) {
        const children = TERIOCK.config.document[droppedDocument?.type]?.plural ?? "";
        const parents = TERIOCK.config.document[this.document?.type]?.plural ?? "";
        if (!this.document.constructor.validateChildType(this.document, droppedDocument)) {
          ui.notifications.error("TERIOCK.SHEETS.Common.NOTIFICATIONS.cantDropType", {
            format: { children: children.capitalize(), parents },
            localize: true,
          });
          return false;
        }
        return true;
      }

      /**
       * Checks if a child document is blocked from being dropped on this document because of insufficient permissions.
       * @param {AnyCommonDocument} droppedDocument
       * @param {Teriock.Application.DropEffect} _dropEffect
       * @returns {boolean}
       */
      _checkChildDropViewer(droppedDocument, _dropEffect) {
        if (!droppedDocument.isViewer) {
          ui.notifications.error("TERIOCK.SHEETS.Common.NOTIFICATIONS.cantDropViewer");
          return false;
        }
        return true;
      }

      /** @inheritDoc */
      _dropEffect() {
        const dropEffect = TeriockDragDrop.dragStartApplication === this ? "none" : "copy";
        if (dropEffect === "none") { return dropEffect; }
        const payload = TeriockDragDrop.payload;
        const dragged = payload?.document;
        // Only child documents can be dropped on the sheet itself; pseudo-documents are handled by other mixins.
        if (!dragged || !CHILD_DOCUMENT_TYPES.includes(payload.type)) { return "none"; }
        if (!this._checkChildDropEditable(dragged, dropEffect)) { return "none"; }
        if (!this.document.constructor.validateChildType(this.document, dragged)) { return "none"; }
        return dropEffect;
      }

      /** @inheritDoc */
      async _onDragLeaveApplication() {
        await super._onDragLeaveApplication();
        this._dropTargetElement?.classList.remove(DROP_TARGET_CLASS);
      }

      /** @inheritDoc */
      async _onDragOver(event) {
        await super._onDragOver(event);
        // Field drop targets receive the drop themselves, so the sheet shouldn't be marked while over one.
        const marked = event.dataTransfer.dropEffect !== "none" && !this._fieldDropTarget(event);
        this._dropTargetElement?.classList.toggle(DROP_TARGET_CLASS, marked);
      }

      /** @inheritDoc */
      _onDragStart(event) {
        if (event.dataTransfer.effectAllowed === "uninitialized") { event.dataTransfer.effectAllowed = "copyMove"; }
        super._onDragStart(event);
      }

      /** @inheritDoc */
      async _onDrop(event) {
        await super._onDrop(event);
        this._dropTargetElement?.classList.remove(DROP_TARGET_CLASS);
        const dropData = TeriockTextEditor.getDragEventData(event);
        if (CHILD_DOCUMENT_TYPES.includes(dropData.type)) { await this._onDropChild(event, dropData); }
      }

      /**
       * Handles dropping of potential children.
       * @param {DragEvent} event
       * @param {Teriock.Application.DropData<AnyCommonDocument>} dropData
       * @returns {Promise<void>}
       */
      async _onDropChild(event, dropData) {
        // Browsers don't reliably report the negotiated dropEffect on the drop event, so recompute it.
        const dropEffect = this._dropEffect(event);
        const Cls = foundry.utils.getDocumentClass(dropData.type);
        const doc = await Cls?.fromDropData(dropData);
        const interactive = dropData.interactive ?? true;
        if (!this._canDropChild(doc, dropEffect)) { return; }
        if (this.#isSubMove(doc, dropEffect)) { return this.#onMoveSub(doc, interactive); }

        const obj = doc.toObject(true);
        if (doc.inCompendium && !doc._stats.compendiumSource) { obj["_stats.compendiumSource"] = doc.uuid; }
        const operations = [
          this.document.getCreateChildDocumentsOperation(doc.documentName, [obj], {
            interactive,
            notifyOnFailure: true,
          }),
        ];
        if (dropEffect === "move" && doc.isOwner && !(doc.inCompendium && doc.pack !== this.document.pack)) {
          operations.push({
            action: "delete",
            documentName: doc.documentName,
            ids: [doc.id],
            notifyOnFailure: true,
            pack: doc.pack,
            parent: doc.parent,
          });
        }
        await foundry.documents.modifyBatch(operations.filter(Boolean));
      }

      /**
       * Explains why a drag that was released over this sheet couldn't be dropped. The browser doesn't fire a drop
       * event for rejected drops, so this is invoked from the drag end instead.
       * @param {DragEvent} _event
       */
      _onDropRejected(_event) {
        const payload = TeriockDragDrop.payload;
        const dragged = payload?.document;
        if (!(dragged instanceof foundry.abstract.Document) || !CHILD_DOCUMENT_TYPES.includes(payload.type)) { return; }
        if (TeriockDragDrop.dragStartApplication === this) { return; }
        this._canDropChild(dragged);
      }
    }
  );
}
