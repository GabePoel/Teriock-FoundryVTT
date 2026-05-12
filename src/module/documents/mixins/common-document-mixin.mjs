import PropagationDataMixin from "../../data/shared/mixins/propagation-data-mixin.mjs";
import { mix } from "../../helpers/construction.mjs";
import { systemPath } from "../../helpers/path.mjs";
import { resolveDocuments } from "../../helpers/resolve.mjs";
import { TeriockActor } from "../_module.mjs";
import { TypeCollection } from "../collections/_module.mjs";
import {
  EmbedCardDocumentMixin,
  PanelDocumentMixin,
  SettingsDocumentMixin,
} from "./_module.mjs";

/**
 * Mixin for common functions used across document classes.
 * @param {typeof BaseDocument} Base
 */
export default function CommonDocumentMixin(Base) {
  //noinspection JSUnusedGlobalSymbols
  return (
    /**
     * @mixes PropagationData
     * @mixes BaseDocument
     * @mixes EmbedCardDocument
     * @mixes PanelDocument
     * @mixes SettingsDocument
     * @mixin
     */
    class CommonDocument extends mix(
      Base,
      PropagationDataMixin,
      EmbedCardDocumentMixin,
      PanelDocumentMixin,
      SettingsDocumentMixin,
    ) {
      /** @inheritDoc */
      static get documentMetadata() {
        return Object.assign(super.documentMetadata, {
          common: true,
          typed: true,
        });
      }

      /** @inheritDoc */
      get SettingsFlagsDataModel() {
        return this.system.SettingsFlagsDataModel;
      }

      /** @type {AnyChildDocument[]} */
      _visibleChildren;

      /**
       * Lazily recomputed array containing all visible children.
       * @returns {AnyChildDocument[]}
       */
      get visibleChildren() {
        if (!this._visibleChildren) {
          this._visibleChildren = this.makeVisibleChildrenArray();
        }
        return this._visibleChildren;
      }

      /** @type {Record<string, AnyChildDocument[]>} */
      _visibleChildrenByType;

      /**
       * Lazily recomputed map of all visible children by their types.
       * @returns {Record<Teriock.Documents.ChildType, AnyChildDocument[]>}
       */
      get visibleChildrenByType() {
        if (!this._visibleChildrenByType) {
          const typeMap = {};
          for (const c of this.visibleChildren) {
            if (!typeMap[c.type]) typeMap[c.type] = [];
            typeMap[c.type].push(c);
          }
          this._visibleChildrenByType = typeMap;
        }
        return this._visibleChildrenByType;
      }

      /**
       * The actor associated with this document if there is one.
       */
      get actor() {
        if (this instanceof TeriockActor) return this;
        else if (this.parent) return this.parent.actor;
        else return null;
      }

      /**
       * Array containing all children or their indexes.
       * @returns {AnyChildDocument[]}
       */
      get childArray() {
        return [
          ...(this.effects?.contents || []).filter((e) => !e.sup),
          ...(this.items?.contents || []).filter((i) => !i.sup),
        ];
      }

      /**
       * Collection containing all children or their indexes.
       * @returns {TypeCollection}
       */
      get children() {
        return new TypeCollection(this.childArray.map((c) => [c._id, c]));
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
        if (this.checkEditor(userId) && this.actor) {
          this.actor.system.postUpdate();
        }
      }

      /** @inheritDoc */
      async _preCreate(data, options, user) {
        const yes = await super._preCreate(data, options, user);
        if (yes === false) return false;

        if (
          !data.img &&
          TERIOCK.config.document[this.type]?.documentName === this.documentName
        ) {
          this.updateSource({
            img: systemPath(`icons/documents/${data.type}.svg`),
          });
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
        return new TypeCollection(children.map((c) => [c._id, c]));
      }

      /**
       * Resolved children, either real or effective.
       * @returns {Promise<AnyCommonDocument[]>}
       */
      async getEffectiveChildren() {
        return this.getVisibleChildren();
      }

      /** @inheritDoc */
      async getPanelParts() {
        return this.system.getPanelParts();
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
       * Executes all macros for a given trigger and calls a regular hook with the same name.
       * @param {Teriock.System.Trigger} trigger - What trigger to call.
       * @param {object} [options]
       * @param {Teriock.System.TriggerScope} [options.scope] - Optional scope to merge into the generated one.
       * @param {boolean} [options.skipCall] - Whether to skip calling normal hooks.
       * @param {boolean} [options.skipPropagation] - Whether to skip propagation.
       * @returns {Promise<void|false>} The mutated data.
       */
      async hookCall(trigger, options = {}) {
        let { skipCall = false, skipPropagation = false, scope = {} } = options;
        scope.trigger = trigger;
        if (!skipPropagation) await this.actor?.fireTrigger(trigger, scope);
        if (!skipCall) {
          return Hooks.call(`teriock.${trigger}`, this, this.getScope(scope));
        }
      }

      /**
       * Make an array of visible children.
       * @returns {AnyChildDocument[]}
       */
      makeVisibleChildrenArray() {
        return this.childArray
          .filter((c) => !c.isEphemeral)
          .filter(
            (c) =>
              c.documentName !== "ActiveEffect" ||
              c.system.revealed ||
              game.user.isGM,
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

      /** @inheritDoc */
      toDragData() {
        return Object.assign(super.toDragData(), { systemType: this.type });
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
