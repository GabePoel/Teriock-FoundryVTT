import { documentConfig } from "../../constants/config/document-config.mjs";
import { mix } from "../../helpers/construction.mjs";
import { getImage } from "../../helpers/path.mjs";
import * as mixins from "../mixins/_module.mjs";

const { JournalEntryPage } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock JournalEntryPage implementation.
 * @implements {Teriock.Documents.JournalEntryPageInterface}
 * @extends {ClientDocument}
 * @extends {JournalEntryPage}
 * @mixes BaseDocument
 * @mixes PanelDocument
 */
export default class TeriockJournalEntryPage extends mix(
  JournalEntryPage,
  mixins.BaseDocumentMixin,
  mixins.PanelDocumentMixin,
) {
  /**
   * An image that represents this.
   * @return {string}
   */
  get img() {
    return (
      this.system?.img ||
      this.getFlag("teriock", "journalImage") ||
      getImage("powers", "Learned Elder Sorceries")
    );
  }

  /** @inheritDoc */
  async getPanelParts() {
    const div = document.createElement("div");
    div.innerHTML = this.text.content;
    div.querySelectorAll("table").forEach((t) => t.remove());
    const html = div.innerHTML;
    return {
      ...(await super.getPanelParts()),
      image: this.img,
      icon:
        documentConfig[this.type]?.icon ||
        this.getFlag("teriock", "journalIcon") ||
        TERIOCK.display.icons.document.core,
      blocks: [
        {
          title:
            this.getFlag("teriock", "journalTitle") ||
            _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
          text: html,
        },
      ],
    };
  }
}
