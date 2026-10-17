import { EmbeddableDataMixin, PanelDataMixin } from "../../data/mixins/_module.mjs";
import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { JournalEntryPage } = foundry.documents;

/**
 * The Teriock JournalEntryPage implementation.
 * @extends {JournalEntryPage}
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
      || TERIOCK.DISPLAY.thumbnails.manifest.power.learnedElderSorceries;
  }

  /**
   * @inheritDoc
   * @returns {TypedIdentifier|null}
   */
  get typedIdentifier() {
    const ruleType = this.getFlag("teriock", "ruleType") ?? this.parent?.getFlag("teriock", "ruleType");
    if (ruleType) { return `${ruleType}:${this.forcedIdentifier}`; }
    return super.typedIdentifier;
  }

  /** @inheritDoc */
  get typeIcon() {
    return this.getFlag("teriock", "ruleIcon") ?? this.parent?.getFlag("teriock", "ruleIcon") ?? super.typeIcon;
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
