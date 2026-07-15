import { BasePreviewModel } from "../../../data/models/preview-models/_module.mjs";
import { fromIdentifier } from "../../../helpers/utils.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function PreviewSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class PreviewSheet extends Base {
      /**
       * Build default child groups.
       * @this {PreviewSheet}
       * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
       */
      static async #previewGroupChildren() {
        const types = this.document.visibleTypes;
        const children = await this.document.getVisibleChildren();
        /** @type {Record<string, Teriock.Previews.PreviewGroup>} */
        const groupRecord = Object.fromEntries(
          types.map(t => [t, { docs: [], empty: TERIOCK.config.document[t].plural, optional: true }]),
        );
        for (const child of children) { if (groupRecord[child.type]) { groupRecord[child.type].docs.push(child); } }
        return Object.values(groupRecord);
      }

      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = { actions: { openIdentifier: this._onOpenIdentifier } };

      /**
       * The preview configuration for this sheet.
       * @type {Record<string, Teriock.Previews.PreviewConfig>}
       */
      static PREVIEWS = {
        children: {
          addButton: { types: app => app.document.visibleTypes },
          data: { display: { gapless: true, size: "small" } },
          groups: this.#previewGroupChildren,
        },
      };

      /**
       * Open whatever document an identifier refers to. Fake documents stand in for things that are not documents, so
       * they cannot use `openDoc`; this opens the thing they represent instead.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async _onOpenIdentifier(_event, target) {
        const doc = await fromIdentifier(target.dataset.identifier);
        if (doc?.documentName === "JournalEntryPage") {
          const journal = doc.parent;
          await journal?.sheet?.render(true);
          journal?.sheet?.goToPage(doc.id);
        } else {
          doc?.sheet?.render(true);
        }
      }

      constructor(...args) {
        super(...args);
        for (const [id, config] of Object.entries(this.constructor.PREVIEWS)) {
          this.#previews[id] = BasePreviewModel.create(id, config, this);
        }
      }

      /** @type {Record<string, BasePreviewModel>} */
      #previews = {};

      /**
       * The visible children of a given type, sorted by that type's configured sorter.
       * @param {string} type
       * @returns {AnyCommonDocument[]}
       */
      _childrenOfType(type) {
        const config = TERIOCK.config.document[type];
        const docs = [...(this.document.visibleChildrenByType[type] ?? [])];
        return config?.sorter ? config.sorter(docs) : docs;
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        this.element.querySelectorAll(".teriock-block[data-uuid]").forEach(/** @param {HTMLElement} el */ el => {
          const uuid = el.dataset.uuid;
          fromUuid(uuid).then(doc => doc?.onEmbed(el));
        });
        for (const preview of Object.values(this.#previews)) { preview.bind(this.element); }
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        await this._preparePreviewContext();
        return Object.assign(context, { previews: this.#previews });
      }

      /**
       * Refresh each preview's groups.
       * @returns {Promise<void>}
       */
      async _preparePreviewContext() {
        for (const [id, config] of Object.entries(this.constructor.PREVIEWS)) {
          this.#previews[id].groups = await config.groups.call(this);
        }
      }

      /** @inheritDoc */
      _toggleCollapsed(collapsibleId, collapsed) {
        collapsed = super._toggleCollapsed(collapsibleId, collapsed);
        for (const tb of this.element.querySelectorAll(`toggle-button[data-collapsible-target=${collapsibleId}]`)) {
          if (tb.isConnected) { tb.value = !collapsed; }
          else { tb.setAttribute("value", String(!collapsed)); }
        }
      }
    }
  );
}
