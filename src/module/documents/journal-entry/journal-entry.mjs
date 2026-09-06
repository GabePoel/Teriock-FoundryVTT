import { EmbeddableDataMixin } from "../../data/mixins/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { JournalEntry } = foundry.documents;

/**
 * The Teriock JournalEntry implementation.
 * @mixes BaseDocument
 * @mixes EmbeddableData
 */
export default class TeriockJournalEntry extends mixClasses(JournalEntry, BaseDocumentMixin, EmbeddableDataMixin) {
  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { img: "icons/svg/book.svg" });
  }
}
