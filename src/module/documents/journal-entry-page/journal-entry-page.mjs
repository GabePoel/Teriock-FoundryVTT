import { getImage } from "../../helpers/path.mjs";
import { mix } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { JournalEntryPage } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link JournalEntry} implementation.
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
  /** @inheritDoc */
  get panelParts() {
    const div = document.createElement("div");
    div.innerHTML = this.text.content;
    div.querySelectorAll("table").forEach((t) => t.remove());
    const html = div.innerHTML;
    return {
      ...super.panelParts,
      image:
        this.system?.img ||
        this.getFlag("teriock", "journalImage") ||
        getImage("powers", "Learned Elder Sorceries"),
      icon: this.getFlag("teriock", "journalIcon") || "book",
      blocks: [
        {
          title: this.getFlag("teriock", "journalTitle") || "Description",
          text: html,
        },
      ],
    };
  }
}
