import { documentConfig } from "../../constants/config/document-config.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { getImage } from "../../helpers/path.mjs";
import * as mixins from "../mixins/_module.mjs";

const { JournalEntryPage } = foundry.documents;

/**
 * The Teriock JournalEntryPage implementation.
 * @implements {Teriock.Documents.JournalEntryPageInterface}
 * @extends {ClientDocument}
 * @extends {JournalEntryPage}
 * @mixes BaseDocument
 * @mixes PanelDocument
 */
export default class TeriockJournalEntryPage extends mixClasses(
  JournalEntryPage,
  mixins.BaseDocumentMixin,
  mixins.PanelDocumentMixin,
) {
  /**
   * An image that represents this.
   * @return {string}
   */
  get img() {
    return this.system?.img || this.getFlag("teriock", "journalImage") || getImage("powers", "learned-elder-sorceries");
  }

  /** @inheritDoc */
  get typedIdentifier() {
    if (this.inCompendium && this.compendium.collection === "teriock.rules") {
      const config = TERIOCK.config.wiki.namespaces[this.parent.name];
      return `${config?.identifierType ?? "rules"}:${this.forcedIdentifier}`;
    }
    return super.typedIdentifier;
  }

  /** @inheritDoc */
  async _buildEmbedHTML(config, options = {}) {
    const embed = await super._buildEmbedHTML(config, options);
    if (!embed && ["damage", "drain"].includes(this.type)) {
      if (["damage", "drain"].includes(this.type)) {
        return this._embedTextPage(config, options);
      }
    }
    return embed;
  }

  /** @inheritDoc */
  async getPanelParts() {
    const div = document.createElement("div");
    div.innerHTML = this.text.content;
    div.querySelectorAll("table").forEach(t => t.remove());
    const html = div.innerHTML;
    return {
      ...(await super.getPanelParts()),
      blocks: [
        {
          text: html,
          title: this.getFlag("teriock", "journalTitle") || _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
        },
      ],
      icon:
        documentConfig[this.type]?.icon ||
        this.getFlag("teriock", "journalIcon") ||
        TERIOCK.display.icons.document.core,
      image: this.img,
    };
  }
}
