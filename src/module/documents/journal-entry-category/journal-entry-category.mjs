import { mixClasses } from "../../helpers/construction.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { JournalEntryCategory } = foundry.documents;

/**
 * The Teriock JournalEntryCategory implementation.
 * @mixes BaseDocument
 */
export default class TeriockJournalEntryCategory extends mixClasses(JournalEntryCategory, BaseDocumentMixin) {}
