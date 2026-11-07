import { mixClasses } from "../../../utils/_module.mjs";
import { DragDropApplicationMixin } from "../../api/mixins/_module.mjs";
import { TeriockDragDrop, TeriockTextEditor } from "../../ux/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

const CHILD_DOCUMENT_TYPES = ["ActiveEffect", "Actor", "Item"];

/**
 * Mixin adding drag-and-drop handling to sheets.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function DragDropSheetMixin(Base) {
  /**
   * @mixes DragDropApplication
   * @mixin
   * @property {TeriockActiveEffect|TeriockActor|TeriockItem} document
   */
  class DragDropSheet extends mixClasses(Base, DragDropApplicationMixin) {
    /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = {
      teriock: {
        dragDrop: {
          dropBehavior: { child: true, effect: "copy", inherit: false },
          style: { maximizeOnDragEnter: true, minimizeOnDragStart: true, styleDropTarget: true },
        },
      },
    };

    /**
     * The entry being sorted, along with where it started.
     * @type {{ element: HTMLElement, next: Element|null, parent: HTMLElement }|null}
     */
    #sortSource = null;

    /**
     * Whether a drop should be performed by moving a sub.
     * @param {TeriockActiveEffect|TeriockActor|TeriockItem} droppedDocument
     * @param {Teriock.Application.DropEffect} dropEffect
     * @returns {boolean}
     * @category Hierarchy
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
     * @param {TeriockActiveEffect|TeriockActor|TeriockItem} droppedDocument
     * @param {boolean} interactive
     * @returns {Promise<void>}
     * @category Hierarchy
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
     * Sort a dragged Document or PseudoDocument to where its entry was dropped.
     * @param {{ element: HTMLElement, next: Element|null }} sortSource
     * @returns {Promise<void>}
     */
    async #onSortDrop({ element, next }) {
      if (!element.isConnected || element.nextElementSibling === next) { return; }
      const elements = Array.from(element.parentElement.children).filter(el => el.dataset.uuid);
      if (element.parentElement.hasAttribute("data-sort-descending")) { elements.reverse(); }
      const docs = elements.map(el => this.document.fetchFromUuidSync(el.dataset.uuid));
      const index = elements.indexOf(element);
      const source = docs[index];
      const target = docs[index + 1] ?? docs[index - 1];
      if (!source || !target) { return; }
      const siblings = docs.filter(d => d && d !== source);
      const sorting = foundry.utils.performIntegerSort(source, {
        siblings,
        sortBefore: target === docs[index + 1],
        target,
      });
      const groups = Map.groupBy(
        sorting,
        s => s.target instanceof foundry.abstract.Document ? s.target.parent : s.target.controller,
      );
      for (const [parent, group] of groups) {
        const { constructor: cls, pack } = group[0].target;
        await cls.updateDocuments(group.map(s => ({ _id: s.target.id, ...s.update })), { pack, parent });
      }
    }

    /**
     * The sup a dropped document would be given by a sub move.
     * @param {TeriockActiveEffect|TeriockActor|TeriockItem} droppedDocument
     * @returns {ID<TeriockActiveEffect|TeriockActor|TeriockItem>|null}
     * @category Hierarchy
     */
    #subMoveTarget(droppedDocument) {
      return droppedDocument.documentName === this.document.documentName ? this.document.id : null;
    }

    /**
     * Document names that may be dropped onto the sheet.
     * @returns {string[]}
     */
    get _droppableDocumentNames() {
      return this.options.teriock.dragDrop.dropBehavior.child ? CHILD_DOCUMENT_TYPES : CONST.ALL_DOCUMENT_TYPES;
    }

    /** @inheritDoc */
    _dropEffect() {
      if (TeriockDragDrop.dragStartApplication === this) {
        return this.#sortSource?.element.isConnected ? "move" : "none";
      }
      const dropEffect = this._payloadDropEffect();
      return this._validateDrop({ dropEffect, notify: false }) ? dropEffect : "none";
    }

    /** @inheritDoc */
    async _onDragEnd(event) {
      // A drag that didn't sort just puts the entry back where it started.
      if (this.#sortSource) {
        const { element, next, parent } = this.#sortSource;
        element.classList.remove("teriock-sort-placeholder");
        if (!next || next.parentElement === parent) { parent.insertBefore(element, next); }
        this.#sortSource = null;
      }
      await super._onDragEnd(event);
    }

    /** @inheritDoc */
    async _onDragOver(event) {
      await super._onDragOver(event);
      const source = this.#sortSource?.element;
      const element = event.target.closest?.("[data-sort-container] > [data-uuid]");
      if (!source || !element || element === source || element.parentElement !== source.parentElement) { return; }
      if (this._fieldDropTarget(event)) { return; }
      const rect = element.getBoundingClientRect();
      const before = event.clientY < rect.top + (rect.height / 2);
      if ((before ? element.previousElementSibling : element.nextElementSibling) === source) { return; }
      element[before ? "before" : "after"](source);
    }

    /** @inheritDoc */
    _onDragStart(event) {
      if (event.dataTransfer.effectAllowed === "uninitialized") { event.dataTransfer.effectAllowed = "copyMove"; }
      super._onDragStart(event);
      const element = event.currentTarget?.closest?.("[data-sort-container] > [data-uuid]");
      if (!this.isEditable || !element || element.dataset.uuid !== event.currentTarget.dataset.uuid) { return; }
      this.#sortSource = { element, next: element.nextElementSibling, parent: element.parentElement };
      setTimeout(() => {
        if (this.#sortSource?.element === element) { element.classList.add("teriock-sort-placeholder"); }
      });
    }

    /** @inheritDoc */
    async _onDrop(event) {
      const sortSource = this.#sortSource;
      this.#sortSource = null;
      sortSource?.element.classList.remove("teriock-sort-placeholder");
      await super._onDrop(event);
      if (sortSource) { return this.#onSortDrop(sortSource); }
      await this._onDropData(event, TeriockTextEditor.getDragEventData(event));
    }

    /**
     * Handles dropping of potential children.
     * @param {DragEvent} event
     * @param {Teriock.Application.DropData<TeriockActiveEffect|TeriockActor|TeriockItem>} dropData
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
      foundry.utils.setProperty(obj, "system._sup", null);
      if (doc.inCompendium && !doc._stats.compendiumSource) { obj["_stats.compendiumSource"] = doc.uuid; }
      const operations = [
        this.document.getCreateChildDocumentsOperation(doc.documentName, [obj], { interactive, notifyOnFailure: true }),
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
     * Data from outside the sheet being dropped into it.
     * @param {DragEvent} event
     * @param {Teriock.Application.DropData<*>} dropData
     * @returns {Promise<void>}
     */
    async _onDropData(event, dropData) {
      if (this.options.teriock.dragDrop.dropBehavior.child && CHILD_DOCUMENT_TYPES.includes(dropData.type)) {
        await this._onDropChild(event, dropData);
      }
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
      if (!this._validateDropChildCyclic(options)) { return false; }
      if (document.parent === this.document) { return this.#isSubMove(document, dropEffect); }
      return true;
    }

    /**
     * Validates that a sub move doesn't make a document its own sup.
     * @param {Teriock.Application.DropValidationOptions} options
     * @returns {boolean}
     * @category Hierarchy
     */
    _validateDropChildCyclic({ document, dropEffect, notify }) {
      return !this.#isSubMove(document, dropEffect) || !document.constructor.checkIfCyclic(this.document, document)
        || this._rejectDrop(notify, "TERIOCK.OPERATIONS.cyclic", { sub: document.name, sup: this.document.name });
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
      return this.options.teriock.dragDrop.dropBehavior.child
        ? this.document?.constructor?.validateChildType?.(this.document, document, { notifyOnFailure: notify })
        : true;
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
     * Validates a dropped Document or PseudoDocument.
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

  return DragDropSheet;
}
