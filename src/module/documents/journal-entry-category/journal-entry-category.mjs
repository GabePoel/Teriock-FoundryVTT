import { mixClasses } from "../../helpers/construction.mjs";
import * as mixins from "../mixins/_module.mjs";

const { JournalEntryCategory } = foundry.documents;

/**
 * The Teriock JournalEntryCategory implementation.
 * @implements {Teriock.Documents.JournalEntryCategoryInterface}
 * @extends {ClientDocument}
 * @extends {JournalEntryCategory}
 * @mixes BaseDocument
 */
export default class TeriockJournalEntryCategory extends mixClasses(JournalEntryCategory, mixins.BaseDocumentMixin) {}
