import { TeriockContextMenu, TeriockTextEditor } from "../../applications/ux/_module.mjs";
import { makeIcon } from "../../helpers/icon.mjs";
import { resolveDocument } from "../../helpers/resolve.mjs";

/**
 * @import { ContextMenuEntry } from "@client/applications/ux/context-menu.mjs";
 */

/**
 * Mixin that provides support for embedding as a card.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, EmbeddableData>}
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
      if (typeof config.path === "string") {
        const field = this.getFieldForProperty(config.path);
        if (field instanceof foundry.data.fields.HTMLField) {
          const html = await TeriockTextEditor.enrichHTML(foundry.utils.getProperty(this, config.path), {
            relativeTo: this,
          });
          return foundry.utils.parseHTML(html);
        }
      }

      const content = await super._buildEmbedHTML(config, options);
      if (content) { return content; }

      const embedContext = foundry.utils.mergeObject(this.embedParts, config);
      if (options.relativeTo) { embedContext.relative = options.relativeTo.uuid; }
      const html = await TeriockTextEditor.renderTemplate("teriock/ui/block", embedContext);
      return foundry.utils.parseHTML(html);
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
        icon: makeIcon(TERIOCK.display.icons.ui.openWindow, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Common.MENU.openSource"),
        onClick: async () => {
          const resolved = await resolveDocument(this.master);
          if (resolved) { await resolved.sheet?.render(true); }
        },
        visible: () => this.master?.isViewer && relative?.uuid !== this.master?.uuid,
      }, {
        group: "document",
        icon: makeIcon(TERIOCK.display.icons.ui.delete, "contextMenu"),
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
      const isEmbedded = element.tagName === "DOCUMENT-EMBED";
      // Mutate block image to remove signs that this could be usable
      if (isEmbedded) {
        const blockImage = element.querySelector(".teriock-block-image");
        if (blockImage) {
          blockImage.removeAttribute("data-tooltip");
          blockImage.classList.remove("usable");
        }
      }
      const addCallbacks = element.classList.contains("teriock-block")
        || Boolean(element.querySelector(`.teriock-block[data-uuid="${this.uuid}"]`));
      if (addCallbacks) {
        const relativeUuid = element.dataset.relative ?? element.querySelector("[data-relative]")?.dataset.relative;
        fromUuid(relativeUuid).then(relative => {
          for (const [type, callback] of Object.entries({ click: "primary", contextmenu: "secondary" })) {
            // The only callback that always gets added is `openDoc`
            element.addEventListener(type, async ev => {
              const target = /** @type {HTMLElement} */ ev.target;
              const el = /** @type {HTMLElement} */ target.closest("[data-action]");
              if (el) {
                const action = el.dataset.action;
                // The action may belong to the sheet rather than to this document, in which case leave it alone.
                const fn = this._embedActions[action]?.[callback];
                if (!fn || (isEmbedded && action !== "openDoc")) { return; }
                ev.stopImmediatePropagation();
                ev.preventDefault();
                if (["openDoc", "useDoc"].includes(action) || game.teriock.checkEditable(relative)) {
                  await fn(ev, relative);
                }
              }
            });
          }
          // Only add context menu entries if this is actually in a document and not just an embedded HTML element
          if (isEmbedded) { return; }
          const menuEntries = this.getEmbedContextMenuEntries(relative);
          if (!menuEntries) { return; }
          new TeriockContextMenu(element, ".teriock-block", menuEntries, {
            eventName: "contextmenu",
            fixed: true,
            jQuery: false,
          });
        });
      }
      super.onEmbed?.(element);
    }
  }

  return EmbeddableData;
}
