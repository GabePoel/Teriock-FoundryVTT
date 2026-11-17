import { EmbeddableDataMixin, PanelDataMixin } from "../../data/mixins/_module.mjs";
import { BasePageSystem } from "../../data/systems/pages/_module.mjs";
import { mergeMetadata, mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin, IdentifierDocumentMixin } from "../mixins/_module.mjs";

const { JournalEntryPage } = foundry.documents;

/**
 * The Teriock JournalEntryPage implementation.
 * @extends {JournalEntryPage}
 * @mixes BaseDocument
 * @mixes EmbeddableData
 * @mixes PanelData
 * @mixes IdentifierDocument
 */
export default class TeriockJournalEntryPage
  extends mixClasses(JournalEntryPage, BaseDocumentMixin, EmbeddableDataMixin, PanelDataMixin, IdentifierDocumentMixin)
{
  /**
   * @inheritDoc
   * @category Identifiers
   */
  static documentMetadata = mergeMetadata(super.documentMetadata, { identifier: { depth: 2 } });

  /**
   * Determine default artwork based on the provided source data.
   * @param {object} data
   * @returns {{system: {img: string|undefined}}}
   */
  static getDefaultArtwork(data) {
    return { system: { img: CONFIG.JournalEntryPage.dataModels[data?.type]?.metadata?.img } };
  }

  /**
   * @inheritDoc
   * @category Identifiers
   */
  static getIdentifierType(doc) {
    if (doc.type === "rule") {
      const ruleType = doc.getFlag("teriock", "ruleType") ?? doc.parent?.getFlag("teriock", "ruleType");
      if (typeof ruleType === "string") { return teriock.utils.toSlug(ruleType); }
    }
    return super.getIdentifierType(doc);
  }

  /**
   * Whether to temporarily override the `hiddenSubpage` flag.
   * @type {boolean}
   */
  revealedSubpage = false;

  /**
   * An image that represents this.
   * @returns {string}
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

  /** @inheritDoc */
  get typeIcon() {
    if (this.type === "rule") {
      return this.getFlag("teriock", "ruleIcon") ?? this.parent?.getFlag("teriock", "ruleIcon") ?? super.typeIcon;
    }
    return super.typeIcon;
  }

  /** @inheritDoc */
  async _embedPanel(config, options = {}) {
    if (!(this.system instanceof BasePageSystem)) { return null; }
    return super._embedPanel(config, options);
  }

  /** @inheritDoc */
  _onClickDocumentLink(event) {
    this.revealedSubpage = true;
    const out = super._onClickDocumentLink(event);
    this.revealedSubpage = false;
    return out;
  }

  /**
   * Roll data.
   * @returns {object}
   */
  getRollData() {
    if (typeof this.system?.getRollData === "function") { return this.system.getRollData(); }
    return {};
  }

  /** @inheritDoc */
  async toTooltip(data = {}, options = {}) {
    if (!(this.system instanceof BasePageSystem)) { return null; }
    return super.toTooltip(data, options);
  }
}
