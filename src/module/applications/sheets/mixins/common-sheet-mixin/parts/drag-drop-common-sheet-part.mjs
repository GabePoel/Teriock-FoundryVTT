import { TeriockDragDrop, TeriockTextEditor } from "../../../../ux/_module.mjs";

/**
 * @param {typeof DocumentSheetV2} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {DocumentSheetV2}
     * @property {TeriockCommon} document
     * @mixin
     */
    class DragDropCommonSheetPart extends Base {
      /**
       * Checks if drag start is allowed.
       * @returns {boolean}
       */
      _canDragStart() {
        return this.isEditable;
      }

      /**
       * Checks if drop is allowed.
       * @returns {boolean}
       */
      _canDrop() {
        return this.isEditable;
      }

      /**
       * Checks if some other document can be dropped on this document.
       * @param {TeriockCommon} doc
       * @returns {boolean}
       */
      _canDropChild(doc) {
        const childTypes = new Set([
          ...this.document.metadata.childEffectTypes,
          ...this.document.metadata.childItemTypes,
          ...this.document.metadata.childMacroTypes,
        ]);
        return (
          this.document.isOwner &&
          doc &&
          doc.parent !== this.document &&
          doc !== this.document &&
          childTypes.has(doc.type)
        );
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
          const dragData = foundry.utils.parseUuid(
            event.currentTarget.dataset.uuid,
          );
          if (dragData) {
            dragData.startSheet = this.id;
            event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
          }
          fromUuid(event.currentTarget.dataset.uuid).then((embedded) => {
            const dragData = embedded?.toDragData();
            if (dragData) {
              dragData.startSheet = this.id;
              event.dataTransfer.setData(
                "text/plain",
                JSON.stringify(dragData),
              );
            }
          });
        }
      }

      /**
       * Handles drop events.
       * @param {Teriock.Sheet.EmbedDragEvent} event
       * @returns {Promise<boolean>} Promise that resolves to true if the drop was handled.
       */
      async _onDrop(event) {
        const dropData = TeriockTextEditor.getDragEventData(event);
        if (dropData.startSheet === this.id) {
          return false;
        }
        let out;
        if (["ActiveEffect", "Item", "Actor"].includes(dropData.type)) {
          out = await this._onDropChild(event, dropData);
        } else if (dropData.type === "Macro") {
          out = await this._onDropMacro(event, dropData);
        } else if (dropData.type === "JournalEntryPage") {
          out = await this._onDropJournalEntryPage(event, dropData);
        }
        return !(!out && Object.keys(dropData).length === 0);
      }

      /**
       * Handles dropping of potential children.
       * @param {Teriock.Sheet.EmbedDragEvent} _event - The drop event.
       * @param {Teriock.Sheet.DropData<TeriockCommon>} dropData - The document drop data.
       * @returns {Promise<TeriockCommon|void>} Promise that resolves to the created document if successful.
       */
      async _onDropChild(_event, dropData) {
        /** @type {typeof ClientDocument} */
        const Cls = foundry.utils.getDocumentClass(dropData.type);
        let doc =
          /** @type {TeriockDocument} */ await Cls.fromDropData(dropData);
        if (doc.type === "wrapper") doc = doc.system.effect;
        const uuid =
          doc.documentName === "ActiveEffect" ? doc.parent.uuid : doc.uuid;
        const obj = doc.toObject();
        if (doc.inCompendium && !doc._stats.compendiumSource) {
          obj["_stats.compendiumSource"] = uuid;
        }
        if (this._canDrop(doc)) {
          const created = await this.document.createChildDocuments(
            doc.documentName,
            [obj],
          );
          return created[0];
        }
      }

      /**
       * Handles dropping of journal entry pages.
       * @param {Teriock.Sheet.EmbedDragEvent} _event - The drop event.
       * @param {Teriock.Sheet.DropData<TeriockJournalEntryPage>} dropData - The document drop data.
       * @returns {Promise<TeriockJournalEntryPage|void>} Promise that resolves to the created document if successful.
       */
      async _onDropJournalEntryPage(_event, dropData) {
        if (game.user.isGM) {
          const updateData = {
            "system.gmNotes": dropData.uuid,
          };
          await this.document.update(updateData);
          return fromUuidSync(dropData.uuid);
        }
      }

      /**
       * Handles dropping of macros.
       * @param {Teriock.Sheet.EmbedDragEvent} _event - The drop event.
       * @param {Teriock.Sheet.DropData<TeriockMacro>} dropData - The document drop data.
       * @returns {Promise<TeriockMacro|void>} Promise that resolves to the created document if successful.
       */
      async _onDropMacro(_event, dropData) {
        if (this.document.system.macros) {
          const macroUuids = Array.from(this.document.system.macros);
          if (dropData.uuid) {
            macroUuids.push(dropData.uuid);
            const updateData = {
              "system.macros": macroUuids,
            };
            await this.document.update(updateData);
          }
        }
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        new TeriockDragDrop({
          dragSelector: ".draggable",
          dropSelector: null,
          callbacks: {
            dragstart: this._onDragStart.bind(this),
            dragover: this._onDragOver.bind(this),
            drop: this._onDrop.bind(this),
          },
          permissions: {
            dragstart: this._canDragStart.bind(this),
            drop: this._canDrop.bind(this),
          },
        }).bind(this.element);
        await super._onRender(context, options);
      }
    }
  );
};
