import { TeriockActor } from "../_module.mjs";
import PropagationDataMixin from "../../data/shared/mixins/propagation-data-mixin.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { systemPath } from "../../helpers/path.mjs";
import { ensureChildren, ensureNoChildren, resolveDocuments } from "../../helpers/resolve.mjs";
import { parseIdentifier } from "../../helpers/utils.mjs";
import { TypeCollection } from "../collections/_module.mjs";
import { EmbedCardDocumentMixin, PanelDocumentMixin, SettingsDocumentMixin } from "./_module.mjs";

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
     * @mixes SettingsDocument
     * @mixin
     */
    class CommonDocument
      extends mixClasses(Base, PropagationDataMixin, EmbedCardDocumentMixin, PanelDocumentMixin, SettingsDocumentMixin)
    {
      /** @inheritDoc */
      static get documentMetadata() {
        return Object.assign(super.documentMetadata, { common: true, typed: true });
      }

      /**
       * Validate whether a document supports a certain child type.
       * @param {AnyCommonDocument} parent
       * @param {AnyChildDocument} child
       * @returns {boolean}
       */
      static validateChildType(parent, child) {
        if (!parent?.metadata?.childItemTypes || !parent?.metadata?.childEffectTypes) { return true; }
        const childTypes = new Set([...parent.metadata.childEffectTypes, ...parent.metadata.childItemTypes]);
        return childTypes.has(child?.type);
      }

      /** @type {AnyChildDocument[]} */
      _visibleChildren;

      /** @type {Record<string, AnyChildDocument[]>} */
      _visibleChildrenByType;

      /**
       * The actor associated with this document if there is one.
       */
      get actor() {
        if (this instanceof TeriockActor) { return this; }
        else if (this.parent) { return this.parent.actor; }
        return null;
      }

      /**
       * Array containing all children or their indexes.
       * @returns {AnyChildDocument[]}
       */
      get childArray() {
        return [
          ...(this.effects?.contents || []).filter(e => !e.sup),
          ...(this.items?.contents || []).filter(i => !i.sup),
        ];
      }

      /**
       * Collection containing all children or their indexes.
       * @returns {TypeCollection}
       */
      get children() {
        return new TypeCollection(this.childArray.map(c => [c._id, c]));
      }

      /** @inheritDoc */
      get embedActions() {
        return { ...super.embedActions, ...this.system.embedActions };
      }

      /** @inheritDoc */
      get embedIcons() {
        return [...super.embedIcons, ...this.system.embedIcons];
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

      /** @inheritDoc */
      get SettingsFlagsDataModel() {
        return this.system.SettingsFlagsDataModel;
      }

      /**
       * Lazily recomputed array containing all visible children.
       * @returns {AnyChildDocument[]}
       */
      get visibleChildren() {
        if (!this._visibleChildren) { this._visibleChildren = this.makeVisibleChildrenArray(); }
        return this._visibleChildren;
      }

      /**
       * Lazily recomputed map of all visible children by their types.
       * @returns {Record<Teriock.Documents.ChildType, AnyChildDocument[]>}
       */
      get visibleChildrenByType() {
        if (!this._visibleChildrenByType) {
          const typeMap = {};
          for (const c of this.visibleChildren) {
            if (!typeMap[c.type]) { typeMap[c.type] = []; }
            typeMap[c.type].push(c);
          }
          this._visibleChildrenByType = typeMap;
        }
        return this._visibleChildrenByType;
      }

      /**
       * Types that can be shown on this document's sheet.
       * @returns {Teriock.Documents.CommonType[]}
       */
      get visibleTypes() {
        return this.system.visibleTypes;
      }

      /** @inheritDoc */
      _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);
        if (this.checkEditor(userId) && this.actor) { this.actor.system.postUpdate(); }
      }

      /** @inheritDoc */
      async _preCreate(data, options, user) {
        const yes = await super._preCreate(data, options, user);
        if (yes === false) { return false; }

        if (!data.img && TERIOCK.config.document[this.type]?.documentName === this.documentName) {
          this.updateSource({ img: systemPath(`icons/documents/${data.type}.svg`) });
        }
        this.updateSource({ sort: game.time.serverTime });
      }

      /**
       * Create multiple child Document instances descendant from a Document using provided input data.
       * @param {ChildDocumentName} embeddedName
       * @param {object[]} data
       * @param {Partial<DatabaseCreateOperation & Teriock.System._CreateOperation>} operation
       * @returns {Promise<AnyCommonDocument[]>}
       */
      async createChildDocuments(embeddedName, data = [], operation = {}) {
        return this.createEmbeddedDocuments(embeddedName, data, operation);
      }

      /**
       * Delete multiple child Document instances descendant from a Document using provided string ids.
       * @param {ChildDocumentName} embeddedName
       * @param {ID<AnyCommonDocument>[]} ids
       * @param {DatabaseDeleteOperation & Teriock.System._Operation} operation
       * @returns {Promise<AnyCommonDocument[]>}
       */
      async deleteChildDocuments(embeddedName, ids = [], operation = {}) {
        return this.deleteEmbeddedDocuments(embeddedName, ids, operation);
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
        return !!(await this.getChildArray()).some(c => c.typedIdentifier === identifier);
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

      /**
       * Make an array of visible children.
       * @returns {AnyChildDocument[]}
       */
      makeVisibleChildrenArray() {
        return this.childArray.filter(c => !c.isEphemeral).filter(c =>
          c.documentName !== "ActiveEffect" || c.system.revealed || game.user.isGM
        );
      }

      /** @inheritDoc */
      prepareData() {
        this.resetChildMaps();
        super.prepareData();
      }

      /**
       * Clear all references to existing visible children so they can be recomputed.
       */
      resetChildMaps() {
        delete this._visibleChildren;
        delete this._visibleChildrenByType;
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
        return this.updateEmbeddedDocuments(embeddedName, updates, operation);
      }
    }
  );
}
