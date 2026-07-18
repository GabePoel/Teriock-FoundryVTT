import { TeriockDragDrop, TeriockTextEditor } from "../../ux/_module.mjs";

const DragDrop = foundry.applications.ux.DragDrop.implementation;

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function DragDropSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @property {AnyCommonDocument} document
     * @mixin
     */
    class DragDropSheet extends Base {
      /**
       * Whether a drop should be performed by moving a sub.
       * @param {AnyCommonDocument} droppedDocument
       * @param {Teriock.Sheet.DropBehavior} behavior
       * @returns {boolean}
       */
      #isSubMove(droppedDocument, behavior) {
        if (behavior !== "move" || !droppedDocument.documentMetadata?.hierarchy) { return false; }
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
       * Checks if a drop is allowed.
       * @returns {boolean}
       */
      _canDragDrop() {
        return this.isEditable;
      }

      /**
       * Checks if drag start is allowed.
       * @param {string} _selector
       * @returns {boolean}
       */
      _canDragStart(_selector) {
        return true;
      }

      /**
       * Checks if some other document can be dropped on this document.
       * @param {AnyCommonDocument} droppedDocument
       * @param {Teriock.Sheet.DropBehavior} [behavior]
       * @returns {boolean}
       */
      _canDropChild(droppedDocument, behavior = "copy") {
        if (!this._checkChildDropEditable(droppedDocument, behavior)) { return false; }
        if (!droppedDocument || droppedDocument === this.document) { return false; }
        if (!this._checkChildDropType(droppedDocument, behavior)) { return false; }
        if (!this._checkChildDropViewer(droppedDocument, behavior)) { return false; }
        if (!this._checkChildDropMove(droppedDocument, behavior)) { return false; }
        if (droppedDocument.parent === this.document) { return this.#isSubMove(droppedDocument, behavior); }
        return true;
      }

      /**
       * Checks if a child document is blocked from being dropped on this document because this isn't editable.
       * @param {AnyCommonDocument} _droppedDocument
       * @param {Teriock.Sheet.DropBehavior} _behavior
       * @returns {boolean}
       */
      _checkChildDropEditable(_droppedDocument, _behavior) {
        return game.teriock.checkEditable(this);
      }

      /**
       * Checks if a child document is blocked from being dropped on this document because its being moved and the user
       * has insufficient permissions to delete the original child document.
       * @param {AnyCommonDocument} droppedDocument
       * @param {Teriock.Sheet.DropBehavior} behavior
       * @returns {boolean}
       */
      _checkChildDropMove(droppedDocument, behavior) {
        if (behavior === "move" && !droppedDocument.isOwner) {
          ui.notifications.error("TERIOCK.SHEETS.Common.NOTIFICATIONS.cantDropMove");
          return false;
        }
        return true;
      }

      /**
       * Checks if a child document is blocked from being dropped on this document because of its type.
       * @param {AnyCommonDocument} droppedDocument
       * @param {Teriock.Sheet.DropBehavior} _behavior
       * @returns {boolean}
       */
      _checkChildDropType(droppedDocument, _behavior) {
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
       * @param {Teriock.Sheet.DropBehavior} _behavior
       * @returns {boolean}
       */
      _checkChildDropViewer(droppedDocument, _behavior) {
        if (!droppedDocument.isViewer) {
          ui.notifications.error("TERIOCK.SHEETS.Common.NOTIFICATIONS.cantDropViewer");
          return false;
        }
        return true;
      }

      /**
       * The behavior to use for a drop that didn't explicitly ask for one.
       * @param {AnyCommonDocument} _droppedDocument
       * @returns {Teriock.Sheet.DropBehavior}
       */
      _defaultDropBehavior(_droppedDocument) {
        return "copy";
      }

      /**
       * Handles drag over events.
       * @param {Teriock.Sheet.EmbedDragEvent} _event
       * @returns {Promise<void>}
       */
      async _onDragOver(_event) {
        if (this._canDragDrop()) { TeriockDragDrop.setDropSheet(this); }
      }

      /**
       * Handles drag start events.
       * @param {Teriock.Sheet.EmbedDragEvent} event
       * @returns {Promise<void>}
       */
      _onDragStart(event) {
        TeriockDragDrop.initializeDrag(event, this);
        if (event.currentTarget.dataset.uuid) {
          fromUuid(event.currentTarget.dataset.uuid).then(embedded => {
            const dragData = embedded?.toDragData();
            if (dragData) { TeriockDragDrop.setDefaultDragEventData(event, { ...dragData, startSheet: this.id }); }
          });
        }
      }

      /**
       * Handles drop events.
       * @param {Teriock.Sheet.EmbedDragEvent} event
       * @returns {Promise<void>}
       */
      async _onDrop(event) {
        const dropData = TeriockTextEditor.getDragEventData(event);
        if (dropData.startSheet === this.id) { return; }
        if (typeof this._onDropMechanic === "function" && await this._onDropMechanic(event, dropData)) { return; }
        if (["ActiveEffect", "Actor", "Item"].includes(dropData.type)) {
          if (this._tab === "mechanics") { return; }
          await this._onDropChild(event, dropData);
        }
      }

      /**
       * Handles dropping of potential children.
       * @param {Teriock.Sheet.EmbedDragEvent} _event
       * @param {Teriock.Sheet.DropData<AnyCommonDocument>} dropData
       * @returns {Promise<void>}
       */
      async _onDropChild(_event, dropData) {
        /** @type {typeof ClientDocument} */
        const Cls = foundry.utils.getDocumentClass(dropData.type);
        const doc = /** @type {AnyChildDocument} */ await Cls.fromDropData(dropData);
        const interactive = dropData.interactive ?? true;
        const behavior = TeriockDragDrop.resolveBehavior(this._defaultDropBehavior(doc), dropData);
        if (!this._canDropChild(doc, behavior)) { return; }
        if (this.#isSubMove(doc, behavior)) { return this.#onMoveSub(doc, interactive); }

        const obj = doc.toObject(true);
        if (doc.inCompendium && !doc._stats.compendiumSource) { obj["_stats.compendiumSource"] = doc.uuid; }
        const operations = [
          this.document.getCreateChildDocumentsOperation(doc.documentName, [obj], {
            interactive,
            notifyOnFailure: true,
          }),
        ];
        if (behavior === "move" && doc.isOwner && !(doc.inCompendium && doc.pack !== this.document.pack)) {
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
      async _onRender(context, options) {
        new DragDrop({
          callbacks: {
            dragover: this._onDragOver.bind(this),
            dragstart: this._onDragStart.bind(this),
            drop: this._onDrop.bind(this),
          },
          dragSelector: ".draggable",
          dropSelector: null,
          permissions: { dragstart: this._canDragStart.bind(this), drop: this._canDragDrop.bind(this) },
        }).bind(this.element);
        await super._onRender(context, options);
      }
    }
  );
}
