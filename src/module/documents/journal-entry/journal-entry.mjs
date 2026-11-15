import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { JournalEntry } = foundry.documents;

/**
 * The Teriock JournalEntry implementation.
 * @extends {JournalEntry}
 * @mixes BaseDocument
 */
export default class TeriockJournalEntry extends mixClasses(JournalEntry, BaseDocumentMixin) {
  /** @inheritDoc */
  _onDelete(options, userId) {
    super._onDelete(options, userId);
    for (const page of this.pages) { game.teriock.identifiers.untrackDocument(page); }
  }
}
