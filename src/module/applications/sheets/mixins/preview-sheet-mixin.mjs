import { BasePreviewModel } from "../../../data/models/preview-models/_module.mjs";
import { fromIdentifier, getSystemClass } from "../../../utils/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PreviewSheetMixin(Base) {
  /**
   * @mixin
   * @property {TeriockActiveEffect|TeriockActor|TeriockItem} document
   */
  class PreviewSheet extends Base {
    /**
     * Build default child groups.
     * @this {PreviewSheet}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     */
    static async #previewGroupChildren() {
      const types = this.document.system.childTypes;
      const children = await this.document.previewed.getContents();
      /** @type {Record<string, Teriock.Previews.PreviewGroup>} */
      const groupRecord = Object.fromEntries(
        types.map(
          t => [t, {
            docs: [],
            empty: _loc(`TERIOCK.DOCUMENTS.${getSystemClass(t).metadata.documentName}.${t}.plural`).toLocaleLowerCase(
              game.i18n.lang,
            ),
            optional: true,
          }]
        ),
      );
      for (const child of children) { if (groupRecord[child.type]) { groupRecord[child.type].docs.push(child); } }
      return Object.values(groupRecord);
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = { actions: { openIdentifier: this._onOpenIdentifier } };

    /**
     * Previews that this sheet's parts can render, keyed by preview id.
     * @type {Record<string, Teriock.Previews.PreviewConfig>}
     */
    static PREVIEWS = {
      children: {
        addButton: { types: app => app.document.system.childTypes },
        data: { display: { gapless: true, size: "small" } },
        groups: this.#previewGroupChildren,
      },
    };

    /**
     * Open whatever document an identifier refers to.
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

    /** @type {Record<string, BasePreviewModel>} */
    #previews = {};

    /** @inheritDoc */
    _attachPartListeners(partId, htmlElement, options) {
      super._attachPartListeners(partId, htmlElement, options);
      htmlElement.querySelectorAll(".teriock-block[data-uuid]").forEach(/** @param {HTMLElement} el */ el => {
        this.document.fetchFromUuid(el.dataset.uuid).then(doc => doc?.attachEmbedListeners?.(el));
      });
      for (const id of this.constructor.PARTS[partId]?.teriock?.previews ?? []) {
        this.#previews[id].bind(htmlElement);
      }
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      return Object.assign(await super._prepareContext(options), { previews: this.#previews });
    }

    /** @inheritDoc */
    async _preparePartContext(partId, context, options) {
      context = await super._preparePartContext(partId, context, options);
      for (const id of this.constructor.PARTS[partId]?.teriock?.previews ?? []) {
        const config = this.constructor.PREVIEWS[id];
        if (!config) { throw new Error(`Preview "${id}" is not registered in ${this.constructor.name}.PREVIEWS.`); }
        this.#previews[id] ??= BasePreviewModel.create(id, config, this);
        this.#previews[id].add = BasePreviewModel.resolveAddButton(config, this);
        this.#previews[id].groups = await config.groups.call(this);
      }
      return context;
    }

    /** @inheritDoc */
    _toggleCollapsed(collapsibleId, collapsed, target) {
      collapsed = super._toggleCollapsed(collapsibleId, collapsed, target);
      for (const tb of this.element.querySelectorAll(`toggle-button[data-collapsible-target="${collapsibleId}"]`)) {
        if (tb.isConnected) { tb.value = !collapsed; }
        else { tb.setAttribute("value", String(!collapsed)); }
      }
      return collapsed;
    }
  }

  return PreviewSheet;
}
