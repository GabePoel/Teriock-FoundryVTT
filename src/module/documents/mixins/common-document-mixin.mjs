import { validateTypedIdentifier } from "../../data/fields/tools/validators.mjs";
import { EmbeddableDataMixin, PanelDataMixin, PropagationDataMixin } from "../../data/mixins/_module.mjs";
import {
  getEnsureChildrenOperations,
  getEnsureNoChildrenOperations,
  getSystemClass,
  makeIconClass,
  mixClasses,
} from "../../utils/_module.mjs";
import { ChildCollection } from "../collections/_module.mjs";

/**
 * @import { DatabaseCreateOperation, DatabaseDeleteOperation, DatabaseUpdateOperation, DatabaseWriteOperation } from "@common/abstract/_types.mjs";
 * @import { ApplicationRenderOptions } from "@client/applications/_types.mjs";
 * @import { DialogV2RenderCallback } from "@client/applications/api/dialog.mjs";
 * @import { TeriockActiveEffect, TeriockActor, TeriockItem } from "../_module.mjs";
 */

/**
 * @typedef {"ActiveEffect" | "Item"} ChildDocumentName
 */

/**
 * Mixin for common functions used across document classes.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function CommonDocumentMixin(Base) {
  /**
   * @mixes EmbeddableData
   * @mixes PanelData
   * @mixes PropagationData
   * @mixin
   */
  class CommonDocument extends mixClasses(Base, PropagationDataMixin, EmbeddableDataMixin, PanelDataMixin) {
    /**
     * @inheritDoc
     * @param {object} [data]
     * @param {DatabaseCreateOperation} [createOptions]
     * @param {object} [options]
     * @param {DialogV2RenderCallback} [options.render]
     * @param {Teriock.Documents.ChildType[]} [options.types] - The types of other common Documents can be included.
     * @param {ApplicationRenderOptions} [renderOptions]
     * @returns {Promise<TeriockActiveEffect|TeriockActor|TeriockItem|null>}
     */
    static async createDialog(data = {}, createOptions = {}, { render, types, ...options } = {}, renderOptions = {}) {
      const { pack, parent, ...operation } = { renderSheet: true, ...createOptions };

      // Special handling so that types of more than one class of Document can be created
      const combined = types?.some(type => !this.TYPES.includes(type));
      const label = _loc(combined ? "DOCUMENT.Document" : this.metadata.label);
      const title = _loc("DOCUMENT.Create", { type: label });

      // Special handling to allow for subs and other child Document relations to be created and also right clicks
      const create = async (createData, renderSheet) => {
        const cls = this.getTypeClass(createData.type);
        const op = renderSheet ? operation : { ...operation, renderSheet: false };
        return parent
          ? (await parent.createChildDocuments(cls.documentName, [createData], op))?.[0]
          : cls.create(createData, { ...op, pack });
      };

      // Add import button and put types under their Document class if there's types not from this Document class
      const dialogOptions = {
        buttons: [{
          action: "import",
          icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.import, "button"),
          label: _loc("TERIOCK.DIALOGS.ImportDocument", { type: label }),
          callback: async (event, button) => {
            let renderSheet = event.type !== "contextmenu";
            const onConfirm = confirmEvent => {
              if (confirmEvent.type === "contextmenu") { renderSheet = false; }
            };
            const importData = await getSystemClass(button.form.elements.type.value).importDocument(createOptions, {
              onConfirm,
            });
            if (!importData) { return null; }
            const formData = new foundry.applications.ux.FormDataExtended(button.form).object;
            const filled = Object.fromEntries(
              Object.entries(formData).filter(([, v]) => v),
            );
            return create(foundry.utils.mergeObject({ ...importData, folder: null }, filled), renderSheet);
          },
        }],
        context: combined
          ? {
            types: types.map(type => {
              const cls = this.getTypeClass(type);
              return {
                group: _loc(cls.metadata.labelPlural),
                label: _loc(CONFIG[cls.documentName].typeLabels[type]),
                value: type,
              };
            }).sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label, game.i18n.lang)),
          }
          : {},
        ok: {
          label: title,
          callback: async (event, button) => {
            // Reimplement using the child operation create data
            const createData = foundry.utils.mergeObject(
              data,
              new foundry.applications.ux.FormDataExtended(button.form, { disabled: true }).object,
              { inplace: false },
            );
            const type = createData.type;
            if (!createData.folder) { delete createData.folder; }
            createData.name = createData.name?.trim() || this.getTypeClass(type).defaultName({ pack, parent, type });
            return create(createData, event.type !== "contextmenu");
          },
        },
        types: types?.filter(type => this.TYPES.includes(type)),
        window: { title },
        render: (event, dialog) => {
          render?.(event, dialog);
          const select = dialog.element.querySelector("[name=type]");
          select.disabled = select.options.length === 1;
          for (const action of Object.keys(dialog.options.buttons)) {
            const button = dialog.element.querySelector(`button[data-action="${action}"]`);
            button.addEventListener("contextmenu", event => dialog._onSubmit(button, event));
          }
        },
      };
      return super.createDialog(data, createOptions, { ...dialogOptions, ...options }, renderOptions);
    }

    /**
     * Determine default artwork based on the provided source data.
     * @param {object} data
     * @returns {{img: string}}
     */
    static getDefaultArtwork(data) {
      return { img: this.getDefaultImageForType(data?.type) ?? this.DEFAULT_ICON };
    }

    /**
     * Get the default image for some type of this document.
     * @param {string} type
     * @returns {string|null}
     */
    static getDefaultImageForType(type) {
      return CONFIG[this.documentName].dataModels[type]?.metadata.img ?? null;
    }

    /** @inheritDoc */
    static getTypeClass(type) {
      if (this.TYPES.includes(type)) { return this; }
      const documentName = getSystemClass(type)?.metadata.documentName;
      return documentName ? foundry.utils.getDocumentClass(documentName) : this;
    }

    /**
     * Validate whether a document supports a certain child type.
     * @param {TeriockActiveEffect|TeriockActor|TeriockItem} parent
     * @param {TeriockActiveEffect|TeriockItem} child
     * @param {Partial<DatabaseWriteOperation & Teriock.System._Operation>} [operation]
     * @returns {boolean}
     */
    static validateChildType(parent, child, operation = {}) {
      if (!parent?.metadata?.childTypes) { return true; }
      const out = parent.metadata.childTypes.includes(child?.type);
      if (!out && operation.notifyOnFailure) {
        ui.notifications.error("TERIOCK.SHEETS.Common.NOTIFICATIONS.cantDropType", {
          format: {
            children: _loc(`TERIOCK.DOCUMENTS.${child.documentName}.${child.type}.plural`),
            parents: _loc(`TERIOCK.DOCUMENTS.${parent.documentName}.${parent.type}.plural`).toLocaleLowerCase(
              game.i18n.lang,
            ),
          },
          localize: true,
        });
      }
      return out;
    }

    /**
     * Make an array of all children or their indexes.
     * @returns {(TeriockActiveEffect|TeriockItem)[]}
     */
    get _childrenSource() {
      return [];
    }

    /** @inheritDoc */
    get _embedActions() {
      return { ...super._embedActions, ...this.system._embedActions };
    }

    /** @inheritDoc */
    get _embedIcons() {
      return [...super._embedIcons, ...this.system._embedIcons];
    }

    /**
     * Make an array of visible children.
     * @returns {(TeriockActiveEffect|TeriockItem)[]}
     */
    get _previewedSource() {
      return this._childrenSource.filter(c => !c.metadata?.tags?.revealable || c?.system?.revealed || game.user.isGM);
    }

    /**
     * The actor associated with this document if there is one.
     * @returns {TeriockActor|null}
     */
    get actor() {
      return this.parent?.actor ?? null;
    }

    /** @inheritDoc */
    get embedParts() {
      return { ...super.embedParts, ...this.system.embedParts };
    }

    /**
     * A convenience getter to an object that organizes all embedded previewed instances by subtype. The object is
     * cached and lazily re-computed as needed. Works like {@link Actor.itemTypes}.
     * @returns {Teriock.Documents.ChildrenByType}
     */
    get previewedTypes() {
      return this.previewed.documentsByType;
    }

    /**
     * Types that can be shown on this document's sheet.
     * @returns {Teriock.Documents.CommonType[]}
     */
    get visibleTypes() {
      return this.system.visibleTypes;
    }

    /** @inheritDoc */
    _configure(options = {}) {
      super._configure(options);
      Object.defineProperties(this, {
        /**
         * A Collection of all the children that are directly descendent from this. This includes both embedded Documents
         * and sub-Documents that are in the same collection. May be actual Documents or their compendium indexes.
         * @type {ChildCollection<TeriockActiveEffect|TeriockItem>}
         */
        children: {
          value: new ChildCollection("children", this, [], {
            types: [...ActiveEffect.implementation.TYPES, ...Item.implementation.TYPES],
          }),
        },
        /**
         * A Collection of Documents or their compendium indexes that are descendant from this to be displayed. These are a
         * combination of direct descendants and ones two or more generations removed depending on specifics. In general,
         * this shows any Documents which should be actively relevant at a glance in this Document's sheet or preview.
         * @type {ChildCollection<TeriockActiveEffect|TeriockItem>}
         */
        previewed: {
          value: new ChildCollection("previewed", this, [], {
            types: [...ActiveEffect.implementation.TYPES, ...Item.implementation.TYPES],
          }),
        },
      });
    }

    /** @inheritDoc */
    _initialize(options = {}) {
      this.children.resetDocuments(this._childrenSource);
      this.previewed.resetDocuments(this._previewedSource);
      super._initialize(options);
    }

    /** @inheritDoc */
    _onUpdate(changed, options, userId) {
      super._onUpdate(changed, options, userId);
      if (this.checkEditor(userId)) {
        if (this.actor) { this.actor.system.postUpdate(); }
        this._onUpdateDocument();
      }
    }

    /** @inheritDoc */
    async _preCreate(data, options, user) {
      const yes = await super._preCreate(data, options, user);
      if (yes === false) { return false; }

      if (!foundry.utils.hasProperty(data, "img") && data?.type && data.type !== "base") {
        const img = this.constructor.getDefaultImageForType(data.type);
        if (img) { this.updateSource({ img }); }
      }
    }

    /**
     * Create multiple child Document instances descendant from a Document using provided input data.
     * @param {ChildDocumentName} embeddedName
     * @param {object[]} data
     * @param {Partial<DatabaseCreateOperation & Teriock.System._CreateOperation>} operation
     * @returns {Promise<(TeriockActiveEffect|TeriockActor|TeriockItem)[]>}
     */
    async createChildDocuments(embeddedName, data = [], operation = {}) {
      const op = this.getCreateChildDocumentsOperation(embeddedName, data, operation);
      if (!op) { return []; }
      const out = await foundry.documents.modifyBatch([op]);
      return out[0];
    }

    /**
     * Delete multiple child Document instances descendant from a Document using provided string ids.
     * @param {ChildDocumentName} embeddedName
     * @param {ID<TeriockActiveEffect|TeriockActor|TeriockItem>[]} ids
     * @param {DatabaseDeleteOperation & Teriock.System._Operation} operation
     * @returns {Promise<(TeriockActiveEffect|TeriockActor|TeriockItem)[]>}
     */
    async deleteChildDocuments(embeddedName, ids = [], operation = {}) {
      const op = this.getDeleteChildDocumentsOperation(embeddedName, ids, operation);
      if (!op) { return []; }
      const out = await foundry.documents.modifyBatch([op]);
      return out[0];
    }

    /**
     * Fire a trigger from this document on its actor and call a hook with the same name.
     * @param {Teriock.System.Trigger} trigger
     * @param {Partial<Teriock.System.TriggerScope>} [scope] - Explicit scope that wins over the generated one.
     * @returns {Promise<boolean>}
     * @category Triggers
     */
    async fireTrigger(trigger, scope = {}) {
      const fullScope = { ...this.getScope(), source: this, ...scope, trigger };
      await this.actor?._dispatchTrigger(trigger, fullScope);
      return Hooks.call(`teriock.${trigger}`, this, fullScope);
    }

    /**
     * Get the operation to create child Documents.
     * @param {ChildDocumentName} embeddedName
     * @param {object[]} data
     * @param {Partial<DatabaseCreateOperation & Teriock.System._CreateOperation>} operation
     * @returns {Partial<DatabaseCreateOperation & Teriock.System._CreateOperation>|null}
     */
    getCreateChildDocumentsOperation(embeddedName, data = [], operation = {}) {
      return { ...operation, action: "create", data, documentName: embeddedName, pack: this.pack, parent: this };
    }

    /**
     * Get the operation to delete child Documents.
     * @param {ChildDocumentName} embeddedName
     * @param {ID<TeriockActiveEffect|TeriockActor|TeriockItem>[]} ids
     * @param {Partial<DatabaseDeleteOperation & Teriock.System._Operation>} operation
     * @returns {Partial<DatabaseDeleteOperation & Teriock.System._Operation>|null}
     */
    getDeleteChildDocumentsOperation(embeddedName, ids = [], operation = {}) {
      return { ...operation, action: "delete", documentName: embeddedName, ids, pack: this.pack, parent: this };
    }

    /**
     * Roll data.
     * @returns {object}
     */
    getRollData() {
      return this.system.getRollData();
    }

    /**
     * Get the operation to update child Documents.
     * @param {ChildDocumentName} embeddedName
     * @param {object[]} updates
     * @param {Partial<DatabaseUpdateOperation & Teriock.System._Operation>} operation
     * @returns {Partial<DatabaseUpdateOperation & Teriock.System._Operation>|null}
     */
    getUpdateChildDocumentsOperation(embeddedName, updates = [], operation = {}) {
      return { ...operation, action: "update", documentName: embeddedName, pack: this.pack, parent: this, updates };
    }

    /** @inheritDoc */
    prepareData() {
      this.resetChildMaps();
      super.prepareData();
      if (this.isTop) {
        this.prepareSpecialData();
        this.prepareCleanupData();
      }
    }

    /**
     * Clear all references to existing visible children so they can be recomputed.
     */
    resetChildMaps() {
      this.children.resetDocuments(this._childrenSource);
      this.previewed.resetDocuments(this._previewedSource);
    }

    /**
     * Toggle a configured child for the Document. Designed to function like {@link Actor.toggleStatusEffect}.
     * @param {TypedIdentifier} identifier - An identifier existing in the world or a compendium.
     * @param {object} [options] - Additional options which modify how the child is created.
     * @param {boolean} [options.active] - Force the child to be active or inactive regardless of its current state.
     * @returns {Promise<TeriockActiveEffect|TeriockItem|boolean|undefined>} - A promise which resolves to one of the following
     * values:
     *  - ChildDocument if new child needs to be created
     *  - true if was already an existing child
     *  - false if an existing child needed to be removed
     *  - undefined if no changes need to be made
     */
    async toggleChild(identifier, options = {}) {
      if (!validateTypedIdentifier(identifier, { strict: true })) { return; }
      const hasChild = this.children.identifiers.has(identifier);
      if (hasChild && options.active) { return true; }
      else if (hasChild && !options.active) {
        await foundry.documents.modifyBatch(await getEnsureNoChildrenOperations(this, [identifier]));
        return false;
      } else if (!hasChild && (options.active === true || typeof options.active !== "boolean")) {
        const out = await foundry.documents.modifyBatch(await getEnsureChildrenOperations(this, [identifier]));
        return out[0]?.[0];
      }
    }

    /**
     * Update multiple child Document instances descendant from a Document using provided differential data.
     * @param {ChildDocumentName} embeddedName
     * @param {object[]} updates
     * @param {DatabaseUpdateOperation} operation
     * @returns {Promise<(TeriockActiveEffect|TeriockActor|TeriockItem)[]>}
     */
    async updateChildDocuments(embeddedName, updates = [], operation = {}) {
      const op = this.getUpdateChildDocumentsOperation(embeddedName, updates, operation);
      if (!op) { return []; }
      const out = await foundry.documents.modifyBatch([op]);
      return out[0];
    }
  }

  return CommonDocument;
}
