import { TeriockDragDrop, TeriockTextEditor } from "../../../../ux/_module.mjs";
import _embeddedFromCard from "../methods/_embedded-from-card.mjs";

export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {DragDropCommonSheetPartInterface}
     * @extends {DocumentSheetV2}
     * @property {TeriockCommon} document
     */
    class DragDropCommonSheetPart extends Base {
      //noinspection JSValidateTypes
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        dragDrop: [
          {
            dragSelector: ".draggable",
            dropSelector: null,
          },
        ],
      };

      constructor(...args) {
        super(...args);
        this.#dragDrop = this.#createDragDropHandlers();
      }

      /** @type {TeriockDragDrop[]} */
      #dragDrop;

      get dragDrop() {
        return this.#dragDrop;
      }

      /**
       * Creates drag and drop handlers for the sheet.
       * @returns {TeriockDragDrop[]} Array of configured drag and drop handlers.
       * @private
       */
      #createDragDropHandlers() {
        //noinspection JSUnresolvedReference
        return this.options.dragDrop.map((config) => {
          config.permissions = {
            dragstart: this._canDragStart.bind(this),
            drop: this._canDragDrop.bind(this),
          };
          config.callbacks = {
            dragstart: this._onDragStart.bind(this),
            dragover: this._onDragOver.bind(this),
            drop: this._onDrop.bind(this),
          };
          return new TeriockDragDrop(config);
        });
      }

      _canDragDrop() {
        return this.editable;
      }

      _canDragStart() {
        return this.editable;
      }

      _canDrop(doc) {
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

      async _onDragOver(_event) {}

      async _onDragStart(event) {
        const embedded = await _embeddedFromCard(this, event.currentTarget);
        const dragData = embedded?.toDragData();
        dragData.startSheet = this.id;
        if (dragData) {
          event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
        }
      }

      async _onDrop(event) {
        const dropData = TeriockTextEditor.getDragEventData(event);
        if (dropData.startSheet === this.id) {
          return false;
        }
        let out;
        if (dropData.type === "ActiveEffect") {
          out = await this._onDropActiveEffect(event, dropData);
        } else if (dropData.type === "Item") {
          out = await this._onDropItem(event, dropData);
        } else if (dropData.type === "Macro") {
          out = await this._onDropMacro(event, dropData);
        } else if (dropData.type === "JournalEntryPage") {
          out = await this._onDropJournalEntryPage(event, dropData);
        }
        return !(!out && Object.keys(dropData).length === 0);
      }

      async _onDropActiveEffect(_event, data) {
        /** @type {typeof ClientDocument} */
        const EffectClass =
          await foundry.utils.getDocumentClass("ActiveEffect");
        const effect =
          /** @type {TeriockEffect} */ await EffectClass.fromDropData(data);
        if (!this._canDrop(effect)) {
          return;
        }
        if (this.document.documentName === "ActiveEffect") {
          effect.updateSource({ "system.hierarchy.supId": this.document.id });
        }
        const target =
          this.document.documentName === "ActiveEffect"
            ? this.document.parent
            : this.document;
        const newEffects = await target.createEmbeddedDocuments(
          "ActiveEffect",
          [effect],
        );
        const newEffect = newEffects[0];
        if (this.document.documentName === "ActiveEffect") {
          await this.document.addSub(newEffect);
        }
        return newEffect;
      }

      async _onDropItem(_event, data) {
        /** @type {typeof ClientDocument} */
        const ItemClass = await foundry.utils.getDocumentClass("Item");
        const item =
          /** @type {TeriockItem} */ await ItemClass.fromDropData(data);
        if (item.type === "wrapper") {
          const wrapperModel = /** @type {TeriockWrapperModel} */ item.system;
          const effect = wrapperModel.effect;
          await this._onDropActiveEffect(_event, effect.toDragData());
          return;
        }
        if (!this._canDrop(item)) {
          return;
        }
        const source = await fromUuid(data.uuid);
        if (
          item.parent?.documentName === "Actor" &&
          item.type === "equipment"
        ) {
          if (
            item.parent?.documentName === "Actor" &&
            item.system?.consumable
          ) {
            const targetItem = this.document.items.getName(item.name);
            if (targetItem && targetItem.system.consumable) {
              targetItem.update({
                "system.quantity":
                  targetItem.system.quantity + item.system.quantity,
              });
              await source.delete();
              return targetItem;
            }
          }
          if (source) {
            await source.delete();
          }
        }
        const newItems =
          /** @type {TeriockItem[]} */ await this.document.actor.createEmbeddedDocuments(
            "Item",
            [item],
            {
              keepId: true,
              keepEmbeddedIds: true,
            },
          );
        if (this.document.documentName !== "Actor") {
          await this.document.addSubs(newItems);
        }
        return newItems[0];
      }

      async _onDropJournalEntryPage(_event, data) {
        if (game.user.isGM) {
          const updateData = {
            "system.gmNotes": data.uuid,
          };
          await this.document.update(updateData);
          return fromUuidSync(data.uuid);
        }
      }

      async _onDropMacro(_event, data) {
        if (this.document.system.macros) {
          const macroUuids = Array.from(this.document.system.macros);
          if (data.uuid) {
            macroUuids.push(data.uuid);
            const updateData = {
              "system.macros": macroUuids,
            };
            await this.document.update(updateData);
          }
        }
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        this.dragDrop.forEach((d) => d.bind(this.element));
      }
    }
  );
};
