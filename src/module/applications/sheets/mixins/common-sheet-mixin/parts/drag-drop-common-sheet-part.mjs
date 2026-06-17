import { TeriockTextEditor } from "../../../../ux/_module.mjs";

const DragDrop = foundry.applications.ux.DragDrop.implementation;

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default Base => {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @property {AnyCommonDocument} document
     * @mixin
     */
    class DragDropCommonSheetPart extends Base {
      /**
       * Checks if drag start is allowed.
       * @returns {boolean}
       */
      _canDragStart() {
        return true;
      }

      /**
       * Checks if a drop is allowed.
       * @returns {boolean}
       */
      _canDrop() {
        return this.isEditable;
      }

      /**
       * Checks if some other document can be dropped on this document.
       * @param {AnyCommonDocument} doc
       * @returns {boolean}
       */
      _canDropChild(doc) {
        if (!game.teriock.checkEditable(this)) { return false; }
        const children = TERIOCK.config.document[doc?.type]?.plural ?? "";
        const parents = TERIOCK.config.document[this.document?.type]?.plural ?? "";
        if (!this.document.constructor.validateChildType(this.document, doc)) {
          ui.notifications.error("TERIOCK.SHEETS.Common.NOTIFICATIONS.cantDropType", {
            format: { children: children.capitalize(), parents },
            localize: true,
          });
          return false;
        }
        if (!doc.isViewer) {
          ui.notifications.error("TERIOCK.SHEETS.Common.NOTIFICATIONS.cantDropPermission");
          return false;
        }
        return Boolean(doc) && doc.parent !== this.document && doc !== this.document;
      }

      /**
       * Handles drag over events.
       * @param {Teriock.Sheet.EmbedDragEvent} _event
       * @returns {Promise<void>}
       */
      async _onDragOver(_event) {}

      /**
       * Handles drag start events.
       * @param {Teriock.Sheet.EmbedDragEvent} event
       * @returns {Promise<void>}
       */
      _onDragStart(event) {
        if (event.currentTarget.dataset.uuid) {
          const dragData = foundry.utils.parseUuid(event.currentTarget.dataset.uuid);
          if (dragData) {
            dragData.startSheet = this.id;
            event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
          }
          fromUuid(event.currentTarget.dataset.uuid).then(embedded => {
            const dragData = embedded?.toDragData();
            if (dragData) {
              dragData.startSheet = this.id;
              event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
            }
          });
        }
      }

      /**
       * Handles drop events.
       * @param {Teriock.Sheet.EmbedDragEvent} event
       * @returns {Promise<TeriockDocument|boolean>} Promise that resolves to true if the drop was handled.
       */
      async _onDrop(event) {
        const dropData = TeriockTextEditor.getDragEventData(event);
        if (dropData.startSheet === this.id) { return false; }
        if (dropData.type === "Automation" && typeof this._onDropAutomation === "function") {
          this._onDropAutomation(event);
        } else if (["ActiveEffect", "Actor", "Item"].includes(dropData.type)) {
          if (this._tab === "automations") { return false; }
          return this._onDropChild(event, dropData);
        } else if (dropData.type === "JournalEntryPage") {
          return this._onDropJournalEntryPage(event, dropData);
        }
        return false;
      }

      /**
       * Handles dropping of potential children.
       * @param {Teriock.Sheet.EmbedDragEvent} _event - The drop event.
       * @param {Teriock.Sheet.DropData<AnyCommonDocument>} dropData - The document drop data.
       * @returns {Promise<AnyCommonDocument|void>} Promise that resolves to the created document if successful.
       */
      async _onDropChild(_event, dropData) {
        /** @type {typeof ClientDocument} */
        const Cls = foundry.utils.getDocumentClass(dropData.type);
        const doc = /** @type {AnyChildDocument} */ await Cls.fromDropData(dropData);
        const uuid = doc.uuid;
        const obj = doc.toObject(true);
        if (doc.inCompendium && !doc._stats.compendiumSource) { obj["_stats.compendiumSource"] = uuid; }
        if (!this._canDropChild(doc)) { return; }
        const created = await this.document.createChildDocuments(doc.documentName, [obj]);
        return created[0];
      }

      /**
       * Handles dropping of journal entry pages.
       * @param {Teriock.Sheet.EmbedDragEvent} _event - The drop event.
       * @param {Teriock.Sheet.DropData<TeriockJournalEntryPage>} dropData - The document drop data.
       * @returns {Promise<TeriockJournalEntryPage|void>} Promise that resolves to the created document if successful.
       */
      async _onDropJournalEntryPage(_event, dropData) {
        if (game.user.isGM) {
          const updateData = { "system.gmNotes": dropData.uuid };
          await this.document.update(updateData);
          return fromUuid(dropData.uuid);
        }
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
          permissions: { dragstart: this._canDragStart.bind(this), drop: this._canDrop.bind(this) },
        }).bind(this.element);
        await super._onRender(context, options);
      }
    }
  );
};
