import { TeriockContextMenu, TeriockTextEditor } from "../../applications/ux/_module.mjs";
import { makeIcon } from "../../utils/_module.mjs";

/**
 * @import { ContextMenuEntry } from "@client/applications/ux/context-menu.mjs";
 * @import { DocumentHTMLEmbedConfig, EnrichmentOptions } from "@client/applications/ux/text-editor.mjs";
 */

/**
 * Mixin that provides support for embedding as a card.
 * @template {MixinBase} T
 * @param {T} Base
 * @todo Turn into data mixin.
 */
export default function EmbeddableDataMixin(Base) {
  /**
   * @implements {Teriock.Embeds.Embeddable}
   * @mixin
   */
  class EmbeddableData extends Base {
    /** @inheritDoc */
    get _embedActions() {
      const actions = { openDoc: { primary: async () => this.sheet.render(true) } };
      for (const embedIcon of this._embedIcons) {
        if (embedIcon.action && embedIcon.onClick) { actions[embedIcon.action] = { primary: embedIcon.onClick }; }
      }
      return actions;
    }

    /** @inheritDoc */
    get _embedIcons() {
      return [];
    }

    /** @inheritDoc */
    get embedParts() {
      return {
        img: this.img,
        makeTooltip: false,
        openable: true,
        subtitle: this.type ? _loc(`TYPES.${this.documentName}.${this.type}`) : _loc(`DOCUMENT.${this.documentName}`),
        text: this.collectionName,
        title: this.name,
        uuid: this.uuid,
      };
    }

    /** @inheritDoc */
    async _buildEmbedHTML(config, options = {}) {
      if (config.type === "block") {
        const out = await this._embedBlock(config, options);
        if (out) { return out; }
      }
      return super._buildEmbedHTML(config, options);
    }

    /**
     * Embed this as a block.
     * @param {DocumentHTMLEmbedConfig} config
     * @param {EnrichmentOptions} [options]
     * @returns {Promise<HTMLElement|HTMLCollection|null>}
     */
    async _embedBlock(config, options = {}) {
      const embedContext = foundry.utils.mergeObject(this.embedParts, { ...config, usable: false });
      if (options.relativeTo) { embedContext.relative = options.relativeTo.uuid; }
      const html = await TeriockTextEditor.renderTemplate("teriock/ui/block", embedContext);
      return foundry.utils.parseHTML(html);
    }

    /** @inheritDoc */
    attachEmbedListeners(element) {
      const relativeUuid = element.dataset.relative;
      (this.fetchFromUuid?.(relativeUuid) ?? fromUuid(relativeUuid)).then(relative => {
        for (const [type, callback] of Object.entries({ click: "primary", contextmenu: "secondary" })) {
          element.addEventListener(type, async ev => {
            const target = /** @type {HTMLElement} */ ev.target;
            const action = target.closest("[data-action]")?.dataset.action;
            // The action may belong to the sheet rather than to this document, in which case leave it alone.
            const fn = this._embedActions[action]?.[callback];
            if (!fn) { return; }
            ev.stopImmediatePropagation();
            ev.preventDefault();
            if (["chatDoc", "openDoc", "useDoc"].includes(action) || game.teriock.checkEditable(relative)) {
              await fn(ev, relative);
            }
          });
        }
        new TeriockContextMenu(element, ".teriock-block", this.getEmbedContextMenuEntries(relative), {
          eventName: "contextmenu",
          fixed: true,
          jQuery: false,
        });
      });
    }

    /** @inheritDoc */
    getEmbedContextMenuEntries(relative) {
      /** @type {ContextMenuEntry[]} */
      const entries = [];
      if (typeof this.system?.getEmbedContextMenuEntries === "function") {
        entries.push(...this.system.getEmbedContextMenuEntries(relative));
      }
      entries.push(...[{
        group: "open",
        icon: makeIcon(TERIOCK.DISPLAY.icons.manifest.ui.openWindow, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Common.MENU.openSource"),
        onClick: async () => {
          const resolved = await this.getMaster?.();
          if (resolved) { await resolved.sheet?.render(true); }
        },
        visible: () => this.master?.isViewer && relative?.uuid !== this.master?.uuid,
      }, {
        group: "document",
        icon: makeIcon(TERIOCK.DISPLAY.icons.manifest.ui.delete, "contextMenu"),
        label: _loc("COMMON.Delete"),
        onClick: async () => await this.deleteDialog({ modal: true }, { interactive: true }),
        visible: () =>
          this._checkValidEditorDocument(relative)
          || (this.inCompendium && !this.compendium.locked && !this.parent && this.sup?.uuid === relative?.uuid),
      }]);
      return entries;
    }

    /** @inheritDoc */
    onEmbed(element) {
      element.querySelector(`.teriock-block[data-uuid="${this.uuid}"]`)?.addEventListener(
        "click",
        () => this.sheet.render(true),
      );
      super.onEmbed?.(element);
    }
  }

  return EmbeddableData;
}
