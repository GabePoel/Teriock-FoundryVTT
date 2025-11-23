import { getImage } from "../../helpers/path.mjs";
import { BaseDocumentMixin, PanelDocumentMixin } from "../mixins/_module.mjs";

const { JournalEntryPage } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link JournalEntry} implementation.
 * @extends {ClientDocument}
 * @extends {JournalEntryPage}
 * @mixes BaseDocument
 */
export default class TeriockJournalEntryPage extends PanelDocumentMixin(
  BaseDocumentMixin(JournalEntryPage),
) {
  /** @inheritDoc */
  get messageParts() {
    const div = document.createElement("div");
    div.innerHTML = this.text.content;
    div.querySelectorAll("table").forEach((t) => t.remove());
    const html = div.innerHTML;
    return {
      ...super.messageParts,
      image:
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
