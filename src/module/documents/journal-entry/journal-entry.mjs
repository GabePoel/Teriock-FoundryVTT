import * as dataMixins from "../../data/mixins/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { JournalEntry } = foundry.documents;

/**
 * The Teriock JournalEntry implementation.
 * @mixes BaseDocument
 * @mixes EmbeddableData
 */
export default class TeriockJournalEntry
  extends mixClasses(JournalEntry, documentMixins.BaseDocumentMixin, dataMixins.EmbeddableDataMixin)
{
  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { img: "icons/svg/book.svg" });
  }
}
