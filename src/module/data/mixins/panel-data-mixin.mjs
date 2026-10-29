import { toId } from "../../utils/_module.mjs";

/**
 * @import { DocumentHTMLEmbedConfig, EnrichmentOptions } from "@client/applications/ux/text-editor.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PanelDataMixin(Base) {
  /** @mixin */
  class PanelData extends Base {
    /** @inheritDoc */
    static get documentMetadata() {
      return Object.assign(super.documentMetadata, { tooltip: true });
    }

    /** @inheritDoc */
    async _buildEmbedHTML(config, options = {}) {
      if (config.type === "panel") {
        const out = await this._embedPanel(config, options);
        if (out) { return out; }
      }
      return super._buildEmbedHTML(config, options);
    }

    /**
     * Embed this as a panel.
     * @param {DocumentHTMLEmbedConfig & EnrichmentOptions} config
     * @param {EnrichmentOptions} [options]
     * @returns {Promise<HTMLElement|HTMLCollection|null>}
     */
    async _embedPanel(config, options = {}) {
      const panel = await this.toPanel({
        _id: toId([options?.relativeTo?.uuid, this.uuid ?? this.id, this.forcedIdentifier].filter(Boolean).join("-"), {
          hash: true,
        }),
      });
      options = { ...options, relativeTo: this };
      const {
        associations = true,
        bars = true,
        blocks = true,
        collapsed = config.values.includes("collapsed"),
        documents = options.documents,
        embeds = options.embeds,
        links = options.links,
        rolls = options.rolls,
        secrets = options.secrets ?? this.isOwner,
      } = config;
      foundry.utils.mergeObject(options, {
        associations,
        bars,
        blocks,
        collapsed,
        documents,
        embeds,
        links,
        rolls,
        secrets,
      });
      return panel.renderElement(options);
    }

    /**
     * Parts of a panel.
     * @returns {Promise<Partial<Teriock.Panels.PanelParts>>}
     */
    async getPanelParts() {
      return Object.assign({
        _id: foundry.utils.randomID(),
        bars: [],
        blocks: [],
        documentUuid: this.uuid,
        icon: this.typeIcon ?? TERIOCK.DISPLAY.icons.manifest.ui.document,
        img: this.img ?? TERIOCK.DISPLAY.thumbnails.common.unknown,
        name: this.fullName || this.name,
      }, await this.system?.getPanelParts?.() ?? {});
    }

    /**
     * Open this document as a panel sheet.
     * @returns {Promise<void>}
     */
    async openPanelSheet() {
      const PanelSheet = teriock.applications.sheets.utility.PanelSheet;
      let panelSheet = Object.values(this.apps).find((a) => a instanceof PanelSheet);
      if (!panelSheet) { panelSheet = new PanelSheet({ document: this }); }
      await panelSheet.render(true);
    }

    /** @inheritDoc */
    async toMessage(options = {}) {
      const panel = await this.toPanel();
      return ChatMessage.implementation.create({
        speaker: ChatMessage.implementation.getSpeaker({ actor: options?.actor ?? this.actor }),
        system: { _src: this.uuid, panels: [panel] },
        type: "shared",
      }, { defaultMode: true });
    }

    /**
     * Represent this as a panel.
     * @param {Partial<Teriock.Panels.PanelParts>} [data]
     * @returns {Promise<Panel>}
     */
    async toPanel(data = {}) {
      return new teriock.data.pseudoDocuments.Panel(Object.assign(await this.getPanelParts(), data));
    }

    /**
     * Represent this as a tooltip.
     * @param {Partial<Teriock.Panels.PanelParts>} [data]
     * @param {Teriock.Panels.EnrichmentOptions & EnrichmentOptions} [options]
     * @returns {Promise<string>}
     */
    async toTooltip(data = {}, options = {}) {
      const panel = await this.toPanel(data);
      return panel.renderHTML({ relativeTo: this, secrets: this.isOwner, ...options });
    }
  }

  return PanelData;
}
