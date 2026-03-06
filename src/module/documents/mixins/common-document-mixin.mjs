import PropagationDataMixin from "../../data/shared/mixins/propagation-data-mixin.mjs";
import { systemPath } from "../../helpers/path.mjs";
import { mix } from "../../helpers/utils.mjs";
import { TeriockActor } from "../_module.mjs";
import {
  ChangeableDocumentMixin,
  EmbedCardDocumentMixin,
  HierarchyDocumentMixin,
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
     * @extends BaseDocument
     * @mixes PropagationData
     * @mixes ChangeableDocument
     * @mixes EmbedCardDocument
     * @mixes HierarchyDocument
     * @mixes PanelDocument
     * @mixes SettingsDocument
     * @mixin
     */
    class CommonDocument extends mix(
      Base,
      PropagationDataMixin,
      ChangeableDocumentMixin,
      EmbedCardDocumentMixin,
      HierarchyDocumentMixin,
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
      get _settingsFlagsDataModel() {
        return this.system._settingsFlagsDataModel;
      }

      /**
       * The actor associated with this document if there is one.
       */
      get actor() {
        if (this instanceof TeriockActor) {
          return this;
        } else if (this.parent) {
          return this.parent.actor;
        } else {
          return null;
        }
      }

      /** @inheritDoc */
      get embedActions() {
        return { ...super.embedActions, ...this.system.embedActions };
      }

      /** @inheritDoc */
      get embedIcons() {
        return [...super.embedIcons, this.system.embedIcons];
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
      get panelParts() {
        return this.system.panelParts;
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
        if ((await super._preCreate(data, options, user)) === false) {
          return false;
        }
        if (!data.img) {
          this.updateSource({
            img: systemPath(`icons/documents/${data.type}.svg`),
          });
        }
        this.updateSource({ sort: game.time.serverTime });
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
       * Executes all macros for a given trigger and calls a regular hook with the same name.
       * @param {Teriock.System.Trigger} trigger - What trigger to call.
       * @param {object} [options]
       * @param {Teriock.System.TriggerScope} [options.scope] - Optional scope to merge into the generated one.
       * @param {boolean} [options.skipCall] - Whether to skip calling normal hooks.
       * @param {boolean} [options.skipPropagation] - Whether to skip propagation.
       * @returns {Promise<Teriock.HookData.BaseHookData>} The mutated data.
       */
      async hookCall(trigger, options = {}) {
        let { skipCall = false, skipPropagation = false, scope = {} } = options;
        scope.trigger = trigger;
        if (!skipPropagation) {
          await this.actor?.fireTrigger(trigger, scope);
        }
        if (!skipCall) {
          Hooks.callAll(`teriock.${trigger}`, this, this.getScope(scope));
        }
        return /** @type {Teriock.HookData.BaseHookData} */ scope;
      }

      /** @inheritDoc */
      toDragData() {
        const dragData = super.toDragData();
        dragData.systemType = this.type;
        return dragData;
      }

      /**
       * Toggles whether this document is disabled.
       * @returns {Promise<void>}
       */
      async toggleDisabled() {
        await this.update({ "system.disabled": !this.system.disabled });
      }
    }
  );
}
