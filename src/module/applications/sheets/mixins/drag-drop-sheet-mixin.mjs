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
       * Document names that may be dropped onto the sheet.
       * @returns {string[]}
       */
      get _droppableDocumentNames() {
        return CHILD_DOCUMENT_TYPES;
      }

      /**
       * What gets marked as where a drop would land.
       * @returns {HTMLElement|null}
       */
      get _dropTargetElement() {
        return this.window.content;
      }

      /** @inheritDoc */
      _dropEffect() {
        if (TeriockDragDrop.dragStartApplication === this) { return "none"; }
        const dropEffect = this._payloadDropEffect();
        return this._validateDrop({ dropEffect, notify: false }) ? dropEffect : "none";
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
        // Recompute `dropEffect` in case the browser didn't report it properly.
        const dropEffect = this._dropEffect(event);
        const Cls = foundry.utils.getDocumentClass(dropData.type);
        const doc = await Cls?.fromDropData(dropData);
        const interactive = dropData.interactive ?? true;
        if (!this._validateDrop({ document: doc, dropEffect })) { return; }
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

      /** @inheritDoc */
      _onDropRejected(event) {
        if (!super._onDropRejected(event)) { return; }
        this._validateDrop();
      }

      /**
       * The effect a drop of the currently dragged document would use.
       * @returns {Teriock.Application.DropEffect}
       */
      _payloadDropEffect() {
        return "copy";
      }

      /**
       * Rejects a drop.
       * @param {boolean} notify
       * @param {string} key
       * @param {Record<string, string>} [format]
       * @returns {boolean}
       */
      _rejectDrop(notify, key, format) {
        if (notify) { ui.notifications.error(key, { format, localize: true }); }
        return false;
      }

      /**
       * Validates a drop.
       * @param {Teriock.Application.DropValidationOptions} [options]
       * @returns {boolean}
       * @todo Add cyclic document validation. Not urgent because it's still stopped in `_preCreate`.
       * @todo Make this into a config object like suppression/error tips to simplify calls.
       * @todo Move to {@link DragDropApplicationMixin}.
       */
      _validateDrop(options = {}) {
        options.document ??= TeriockDragDrop.payload?.document;
        options.dropEffect ??= this._payloadDropEffect();
        options.notify ??= true;
        if (!options.document) { return false; }
        if (!this._validateDropEditable(options)) { return false; }
        return this._validateDropDocument(options);
      }

      /**
       * Validates dropping a child document.
       * @param {Teriock.Application.DropValidationOptions} options
       * @returns {boolean}
       */
      _validateDropChild(options) {
        const { document, dropEffect } = options;
        if (document === this.document) { return false; }
        if (!this._validateDropChildType(options)) { return false; }
        if (!this._validateDropChildViewer(options)) { return false; }
        if (!this._validateDropChildMove(options)) { return false; }
        if (document.parent === this.document) { return this.#isSubMove(document, dropEffect); }
        return true;
      }

      /**
       * Validates that a moved child document can be deleted from its source.
       * @param {Teriock.Application.DropValidationOptions} options
       * @returns {boolean}
       */
      _validateDropChildMove({ document, dropEffect, notify }) {
        return dropEffect !== "move" || document.isOwner
          || this._rejectDrop(notify, "TERIOCK.SHEETS.Common.NOTIFICATIONS.cantDropMove");
      }

      /**
       * Validates that a child document's type is allowed.
       * @param {Teriock.Application.DropValidationOptions} options
       * @returns {boolean}
       */
      _validateDropChildType({ document, notify }) {
        return this.document.constructor.validateChildType(this.document, document, { notifyOnFailure: notify });
      }

      /**
       * Validates that a child document can be viewed.
       * @param {Teriock.Application.DropValidationOptions} options
       * @returns {boolean}
       */
      _validateDropChildViewer({ document, notify }) {
        return document.isViewer || this._rejectDrop(notify, "TERIOCK.SHEETS.Common.NOTIFICATIONS.cantDropViewer");
      }

      /**
       * Validates a dropped document or pseudo-document.
       * @param {Teriock.Application.DropValidationOptions} options
       * @returns {boolean}
       */
      _validateDropDocument(options) {
        if (!this._validateDropDocumentName(options)) { return false; }
        if (CHILD_DOCUMENT_TYPES.includes(options.document.documentName)) { return this._validateDropChild(options); }
        return true;
      }

      /**
       * Validates a dropped document's `documentName`.
       * @param {Teriock.Application.DropValidationOptions} options
       * @returns {boolean}
       */
      _validateDropDocumentName({ document, notify }) {
        return this._droppableDocumentNames.includes(document.documentName)
          || this._rejectDrop(notify, "TERIOCK.SHEETS.Common.NOTIFICATIONS.cantDropDocumentName");
      }

      /**
       * Validates that this sheet can be edited.
       * @param {Teriock.Application.DropValidationOptions} options
       * @returns {boolean}
       */
      _validateDropEditable({ notify }) {
        return this.isEditable || this._rejectDrop(notify, "TERIOCK.DIALOGS.Common.ERRORS.notEditable");
      }
    }
  );
}
