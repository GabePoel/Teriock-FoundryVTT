import { systemPath } from "../../../helpers/path.mjs";
import { mix } from "../../../helpers/utils.mjs";
import { TeriockActor } from "../../_module.mjs";
import { HierarchyDocumentMixin } from "../_module.mjs";
import ChangeableDocumentMixin from "../changeable-document-mixin/changeable-document-mixin.mjs";
import EmbedCardDocumentMixin from "../embed-card-document-mixin/embed-card-document-mixin.mjs";
import PanelDocumentMixin from "../panel-document-mixin/panel-document-mixin.mjs";

/**
 * Mixin for common functions used across document classes.
 * @param {typeof ClientDocument} Base
 */
export default function CommonDocumentMixin(Base) {
  //noinspection JSUnusedGlobalSymbols
  return (
    /**
     * @extends ClientDocument
     * @mixes EmbedCardDocument
     * @mixes PanelDocument
     * @mixes ChangeableDocument
     * @mixin
     */
    class CommonDocument extends mix(
      Base,
      HierarchyDocumentMixin,
      PanelDocumentMixin,
      EmbedCardDocumentMixin,
      ChangeableDocumentMixin,
    ) {
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

      /**
       * A modified version of this document's name that displays additional text if needed.
       * @returns {string}
       */
      get nameString() {
        return this.system.nameString;
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
       * Executes all macros for a given pseudo-hook and calls a regular hook with the same name.
       * @param {Teriock.Parameters.Shared.PseudoHook} pseudoHook - What pseudo-hook to call.
       * @param {Partial<Teriock.HookData.BaseHookData>} [data] - Data to call in each connected {@link TeriockMacro}.
       * @param {TeriockEffect} [effect] - Only call {@link TeriockMacro}s provided by this {@link TeriockEffect}.
       * @param {boolean} [skipCall] - Whether to skip calling normal hooks.
       * @returns {Promise<Teriock.HookData.BaseHookData>} The mutated data.
       */
      async hookCall(pseudoHook, data = {}, effect = null, skipCall = false) {
        data.cancel = false;
        if (this.system.hookedMacros) {
          if (!data) {
            data = {};
          }
          data.cancel = false;
          if (!skipCall) {
            Hooks.callAll(`teriock.${pseudoHook}`, this, data);
            skipCall = true;
          }
          let macroUuids = this.system.hookedMacros[pseudoHook];
          if (macroUuids) {
            if (effect) {
              macroUuids = macroUuids.filter((uuid) =>
                effect.changes
                  .filter((c) => c.key === `system.hookedMacros.${pseudoHook}`)
                  .map((c) => c.value)
                  .includes(uuid),
              );
            }
            for (const macroUuid of macroUuids) {
              /** @type {TeriockMacro} */
              const macro = await fromUuid(macroUuid);
              if (macro) {
                await macro.execute({
                  actor: this,
                  data: data,
                });
              }
            }
          }
        }
        if (this.documentName !== "Actor" && this.actor) {
          await this.actor.hookCall(pseudoHook, data, effect, skipCall);
        }
        return /** @type {Teriock.HookData.BaseHookData} */ data;
      }

      /** @inheritDoc */
      prepareData() {
        super.prepareData();
      }

      /**
       * Data preparation that happens after `prepareDerivedData()`. This allows {@link TeriockChild} documents to apply
       * changes from the parent {@link TeriockActor} and should be primarily used for that purpose.
       * {@link TeriockActor}s are the only documents that call this directly. In all other cases, it is only called
       * if the parent document calls it.
       */
      prepareSpecialData() {
        this.system.prepareSpecialData();
      }

      /**
       * Add statuses and explanations for "virtual effects". These are things that would otherwise be represented with
       * {@link TeriockEffect}s, but that we want to be able to add synchronously during the update cycle. Any of these
       * effects that should be shown on the token need to be manually added to {@link TeriockToken._drawEffects}.
       */
      prepareVirtualEffects() {
        this.system.prepareVirtualEffects();
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
