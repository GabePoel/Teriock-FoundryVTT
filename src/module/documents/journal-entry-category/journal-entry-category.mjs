import { mixClasses } from "../../helpers/construction.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { JournalEntryCategory } = foundry.documents;

/**
 * The Teriock JournalEntryCategory implementation.
 * @extends {JournalEntryCategory}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @implements {Teriock.Documents.JournalEntryCategoryInterface}
 */
export default class TeriockJournalEntryCategory
  extends mixClasses(JournalEntryCategory, documentMixins.BaseDocumentMixin)
{}
