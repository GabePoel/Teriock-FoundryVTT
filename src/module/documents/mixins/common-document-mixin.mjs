import { TeriockActor } from "../_module.mjs";
import * as dataMixins from "../../data/mixins/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { systemPath } from "../../helpers/path.mjs";
import { ensureChildren, ensureNoChildren, resolveDocuments } from "../../helpers/resolve.mjs";
import { parseIdentifier } from "../../helpers/utils.mjs";
import { TypeCollection } from "../collections/_module.mjs";
import * as documentMixins from "./_module.mjs";

/**
 * Mixin for common functions used across document classes.
 * @param {typeof BaseDocument} Base
 */
export default function CommonDocumentMixin(Base) {
  return (
    /**
     * @mixes BaseDocument
     * @mixes EmbedCardDocument
     * @mixes PanelDocument
     * @mixes PropagationData
     * @mixin
     */
    class CommonDocument
      extends mixClasses(
        Base,
        dataMixins.PropagationDataMixin,
        documentMixins.EmbedCardDocumentMixin,
        documentMixins.PanelDocumentMixin,
      )
    {
      /** @inheritDoc */
      static get documentMetadata() {
        return Object.assign(super.documentMetadata, { common: true, typed: true });
      }

      /**
       * Get the default image for some type of this document.
       * @param {string} type
       * @returns {string}
       */
      static getDefaultImageForType(type) {
        if (type && TERIOCK.config.document[type]?.documentName === this.documentName) {
          return systemPath(`icons/documents/${type}.svg`);
        }
      }

      /**
       * Validate whether a document supports a certain child type.
       * @param {AnyCommonDocument} parent
       * @param {AnyChildDocument} child
       * @param {Partial<DatabaseWriteOperation & Teriock.System._Operation>} [operation]
       * @returns {boolean}
       */
      static validateChildType(parent, child, operation = {}) {
        if (!parent?.metadata?.childItemTypes || !parent?.metadata?.childEffectTypes) { return true; }
        const childTypes = new Set([...parent.metadata.childEffectTypes, ...parent.metadata.childItemTypes]);
        const out = childTypes.has(child?.type);
        if (!out && operation.notifyOnFailure) {
          ui.notifications.error("TERIOCK.SHEETS.Common.NOTIFICATIONS.cantDropType", {
            format: {
              children: (TERIOCK.config.document[child?.type]?.plural ?? "").capitalize(),
              parents: TERIOCK.config.document[parent?.type]?.plural ?? "",
            },
            localize: true,
          });
        }
        return out;
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
       * The actor associated with this document if there is one.
       */
      get actor() {
        if (this instanceof TeriockActor) { return this; }
        else if (this.parent) { return this.parent.actor; }
        return null;
      }

      /**
       * Lazily recomputed array containing all children or their indexes.
       * @returns {AnyChildDocument[]}
       */
      get childArray() {
        if (!this._cache.childArray) { this._cache.childArray = this._makeChildArray(); }
        return this._cache.childArray;
      }

      /**
       * Lazily recomputed collection containing all children or their indexes.
       * @returns {TypeCollection}
       */
      get children() {
        if (!this._cache.children) { this._cache.children = new TypeCollection(this.childArray.map(c => [c._id, c])); }
        return this._cache.children;
      }

      /** @inheritDoc */
      get embedParts() {
        return { ...super.embedParts, ...this.system.embedParts };
      }

      /**
       * The document type's metadata.
       * @returns {Teriock.Documents.ModelMetadata}
       */
      get metadata() {
        return this.system.constructor.metadata;
      }

      /**
       * Lazily recomputed array containing all visible children.
       * @returns {AnyChildDocument[]}
       */
      get visibleChildren() {
        if (!this._cache.visibleChildren) { this._cache.visibleChildren = this._makeVisibleChildrenArray(); }
        return this._cache.visibleChildren;
      }

      /**
       * Lazily recomputed map of all visible children by their types.
       * @returns {Record<Teriock.Documents.ChildType, AnyChildDocument[]>}
       */
      get visibleChildrenByType() {
        if (!this._cache.visibleChildrenByType) {
          const typeMap = {};
          for (const c of this.visibleChildren) {
            if (!typeMap[c.type]) { typeMap[c.type] = []; }
            typeMap[c.type].push(c);
          }
          this._cache.visibleChildrenByType = typeMap;
        }
        return this._cache.visibleChildrenByType;
      }

      /**
       * Types that can be shown on this document's sheet.
       * @returns {Teriock.Documents.CommonType[]}
       */
      get visibleTypes() {
        return this.system.visibleTypes;
      }

      /**
       * Make an array of all children or their indexes.
       * @returns {AnyChildDocument[]}
       */
      _makeChildArray() {
        return [
          ...(this.effects?.contents || []).filter(e => !e.sup),
          ...(this.items?.contents || []).filter(i => !i.sup),
        ];
      }

      /**
       * Make an array of visible children.
       * @returns {AnyChildDocument[]}
       */
      _makeVisibleChildrenArray() {
        return this.childArray.filter(c => c.documentName !== "ActiveEffect" || c.system.revealed || game.user.isGM);
      }

      /** @inheritDoc */
      _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);
        if (this.checkEditor(userId)) {
          if (this.actor) { this.actor.system.postUpdate(); }
          this.fireTrigger("updateDocument", this.getScope());
        }
      }

      /** @inheritDoc */
      async _preCreate(data, options, user) {
        const yes = await super._preCreate(data, options, user);
        if (yes === false) { return false; }

        if (!foundry.utils.hasProperty(data, "img")) {
          this.updateSource({ img: this.constructor.getDefaultImageForType(data?.type) });
        }
      }

      /**
       * Create multiple child Document instances descendant from a Document using provided input data.
       * @param {ChildDocumentName} embeddedName
       * @param {object[]} data
       * @param {Partial<DatabaseCreateOperation & Teriock.System._CreateOperation>} operation
       * @returns {Promise<AnyCommonDocument[]>}
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
       * @param {ID<AnyCommonDocument>[]} ids
       * @param {DatabaseDeleteOperation & Teriock.System._Operation} operation
       * @returns {Promise<AnyCommonDocument[]>}
       */
      async deleteChildDocuments(embeddedName, ids = [], operation = {}) {
        const op = this.getDeleteChildDocumentsOperation(embeddedName, ids, operation);
        if (!op) { return []; }
        const out = await foundry.documents.modifyBatch([op]);
        return out[0];
      }

      /**
       * Disables the document.
       * @returns {Promise<void>}
       */
      async disable() {
        await this.update({ "system.disabled": true });
      }

      /**
       * Enables the document.
       * @returns {Promise<void>}
       */
      async enable() {
        await this.update({ "system.disabled": false });
      }

      /**
       * Resolved array containing all children.
       * @returns {Promise<AnyCommonDocument[]>}
       */
      async getChildArray() {
        return resolveDocuments(this.childArray);
      }

      /**
       * Resolved collection containing all children.
       * @returns {Promise<TypeCollection>}
       */
      async getChildren() {
        const children = await resolveDocuments(this.childArray);
        return new TypeCollection(children.map(c => [c._id, c]));
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
       * @param {ID<AnyCommonDocument>[]} ids
       * @param {Partial<DatabaseDeleteOperation & Teriock.System._Operation>} operation
       * @returns {Partial<DatabaseDeleteOperation & Teriock.System._Operation>|null}
       */
      getDeleteChildDocumentsOperation(embeddedName, ids = [], operation = {}) {
        return { ...operation, action: "delete", documentName: embeddedName, ids, pack: this.pack, parent: this };
      }

      /**
       * Resolved children, either real or effective.
       * @returns {Promise<AnyCommonDocument[]>}
       */
      async getEffectiveChildren() {
        return this.getVisibleChildren();
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

      /**
       * Resolved visible children.
       * @returns {Promise<AnyCommonDocument[]>}
       */
      async getVisibleChildren() {
        return resolveDocuments(this.visibleChildren);
      }

      /**
       * Check if this document has a child with the given identifier.
       * @param {TypedIdentifier} identifier
       * @returns {Promise<boolean>}
       */
      async hasChild(identifier) {
        const parsed = parseIdentifier(identifier);
        if (!parsed) { return false; }
        return Boolean((await this.getChildArray()).some(c => c.typedIdentifier === identifier));
      }

      /**
       * Executes all macros for a given trigger and calls a regular hook with the same name.
       * @param {Teriock.System.Trigger} trigger - What trigger to call.
       * @param {object} [options]
       * @param {Teriock.System.TriggerScope} [options.scope] - Optional scope to merge into the generated one.
       * @param {boolean} [options.skipCall] - Whether to skip calling normal hooks.
       * @param {boolean} [options.skipPropagation] - Whether to skip propagation.
       * @returns {Promise<void|false>} The mutated data.
       */
      async hookCall(trigger, options = {}) {
        const { scope = {}, skipCall = false, skipPropagation = false } = options;
        scope.trigger = trigger;
        if (!skipPropagation) { await this.actor?.fireTrigger(trigger, scope); }
        if (!skipCall) { return Hooks.call(`teriock.${trigger}`, this, this.getScope(scope)); }
      }

      /** @inheritDoc */
      prepareData() {
        this.resetChildMaps();
        super.prepareData();
        if (this.isTop) { this.prepareSpecialData(); }
        if (this.isTop) { this.prepareCleanupData(); }
      }

      /**
       * Clear all references to existing visible children so they can be recomputed.
       */
      resetChildMaps() {
        delete this._cache.childArray;
        delete this._cache.children;
        delete this._cache.visibleChildren;
        delete this._cache.visibleChildrenByType;
      }

      /**
       * Toggle a configured child for the Document. Designed to function like {@link Actor.toggleStatusEffect}.
       * @param {TypedIdentifier} identifier - An identifier existing in the world or a compendium.
       * @param {object} [options] - Additional options which modify how the child is created.
       * @param {boolean} [options.active] - Force the child to be active or inactive regardless of its current state.
       * @returns {Promise<AnyChildDocument|boolean|undefined>} - A promise which resolves to one of the following
       * values:
       *  - ChildDocument if new child needs to be created
       *  - true if was already an existing child
       *  - false if an existing child needed to be removed
       *  - undefined if no changes need to be made
       */
      async toggleChild(identifier, options = {}) {
        if (!parseIdentifier(identifier)) { return; }
        const hasChild = await this.hasChild(identifier);
        if (hasChild && options.active) { return true; }
        else if (hasChild && !options.active) {
          await ensureNoChildren(this, [identifier]);
          return false;
        } else if (!hasChild && (options.active === true || typeof options.active !== "boolean")) {
          const out = await ensureChildren(this, [identifier]);
          return out[0];
        }
      }

      /**
       * Toggles whether this document is disabled.
       * @returns {Promise<void>}
       */
      async toggleDisabled() {
        await this.update({ "system.disabled": !this.system.disabled });
      }

      /**
       * Update multiple child Document instances descendant from a Document using provided differential data.
       * @param {ChildDocumentName} embeddedName
       * @param {object[]} updates
       * @param {DatabaseUpdateOperation} operation
       * @returns {Promise<AnyCommonDocument[]>}
       */
      async updateChildDocuments(embeddedName, updates = [], operation = {}) {
        const op = this.getUpdateChildDocumentsOperation(embeddedName, updates, operation);
        if (!op) { return []; }
        const out = await foundry.documents.modifyBatch([op]);
        return out[0];
      }
    }
  );
}
