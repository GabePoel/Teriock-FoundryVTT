import { systemPath } from "../../helpers/path.mjs";
import { toId } from "../../helpers/string.mjs";

/**
 * @import { EnrichmentOptions } from "@client/applications/ux/text-editor.mjs";
 */

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, PanelData>}
 * @todo Make this into a data mixin and remove virtual affinities.
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
      if (config.values.includes("panel")) {
        // TODO: Consider removing this caption removal
        if (!config.label) { config.caption = false; }
        const panelOptions = {
          noAssociations: config.values.includes("noAssociations"),
          noBars: config.values.includes("noBars"),
          noBlocks: config.values.includes("noBlocks"),
          relativeTo: this,
          secrets: this.isOwner,
        };
        const panel = await this.toPanel({
          _id: toId(
            [options?.relativeTo?.uuid, this.uuid ?? this.id, this.forcedIdentifier].filter(Boolean).join("-"),
            { hash: true },
          ),
        });
        return panel.renderElement(panelOptions);
      }
      return super._buildEmbedHTML(config, options);
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
        icon: TERIOCK.display.icons.manifest.ui.document,
        img: this.img ?? systemPath("icons/documents/uncertainty.svg"),
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
        speaker: ChatMessage.implementation.getSpeaker({
          actor: options?.actor ?? this.actor
            ?? ChatMessage.implementation.getSpeakerActor(ChatMessage.implementation.getSpeaker()),
        }),
        system: { _src: this.uuid, panels: { [panel.id]: panel.toObject() } },
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
