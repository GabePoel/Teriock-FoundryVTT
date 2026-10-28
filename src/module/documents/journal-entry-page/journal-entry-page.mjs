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
   * Determine default artwork based on the provided source data.
   * @param {object} data
   * @returns {{system: {img: string|undefined}}}
   */
  static getDefaultArtwork(data) {
    return { system: { img: CONFIG.JournalEntryPage.dataModels[data?.type]?.metadata?.img } };
  }

  /**
   * Whether to temporarily override the `hiddenSubpage` flag.
   * @type {boolean}
   */
  revealedSubpage = false;

  /**
   * An image that represents this.
   * @return {string}
   */
  get img() {
    return this.system?.img || this.getFlag("teriock", "journalImage")
      || TERIOCK.DISPLAY.thumbnails.manifest.power.learnedElderSorceries;
  }

  /**
   * Whether this should be hidden from the journal entry sheet table of contents. This is used when we have pages that
   * exist to make nice tooltips but are mainly just embedded in other pages.
   * @returns {boolean}
   */
  get isHidden() {
    return !this.revealedSubpage && this.getFlag("teriock", "hiddenSubpage");
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
  _onClickDocumentLink(event) {
    this.revealedSubpage = true;
    const out = super._onClickDocumentLink(event);
    this.revealedSubpage = false;
    return out;
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
