import { EmbeddableDataMixin, PanelDataMixin } from "../../data/mixins/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { JournalEntryPage } = foundry.documents;

/**
 * The Teriock JournalEntryPage implementation.
 * @mixes BaseDocument
 * @mixes EmbeddableData
 * @mixes PanelData
 */
export default class TeriockJournalEntryPage
  extends mixClasses(JournalEntryPage, BaseDocumentMixin, EmbeddableDataMixin, PanelDataMixin)
{
  /**
   * An image that represents this.
   * @return {string}
   */
  get img() {
    return this.system?.img || this.getFlag("teriock", "journalImage")
      || TERIOCK.display.images.manifest.powers.learnedElderSorceries;
  }

  /** @inheritDoc */
  get typedIdentifier() {
    if (this.inCompendium && this.compendium.collection === "teriock.rules") {
      const config = TERIOCK.config.wiki.namespaces[this.parent.name];
      if (config) { return `${config?.identifierType ?? "rule"}:${this.forcedIdentifier}`; }
    }
    return super.typedIdentifier;
  }

  /** @inheritDoc */
  get typeIcon() {
    return this.getFlag("teriock", "journalIcon") ?? super.typeIcon;
  }

  /** @inheritDoc */
  async _buildEmbedHTML(config, options = {}) {
    const embed = await super._buildEmbedHTML(config, options);
    if ((!embed || config.values.includes("text")) && this.system?.metadata?.tags?.text) {
      return this._embedTextPage(config, options);
    }
    return embed;
  }

  /** @inheritDoc */
  async getPanelParts() {
    const parts = await super.getPanelParts();
    if (this.type !== "text") { return parts; }
    return {
      ...parts,
      blocks: [{
        text: `@Embed[${this.uuid} text inline=true]`,
        title: this.getFlag("teriock", "journalTitle") || _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
      }],
    };
  }

  /**
   * Roll data.
   * @returns {object}
   */
  getRollData() {
    if (typeof this.system?.getRollData === "function") { return this.system.getRollData(); }
    return {};
  }
}
