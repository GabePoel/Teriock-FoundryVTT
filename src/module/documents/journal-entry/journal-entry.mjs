import { mixClasses } from "../../helpers/construction.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { JournalEntry } = foundry.documents;

/**
 * The Teriock JournalEntry implementation.
 * @extends {JournalEntry}
 * @mixes BaseDocument
 */
export default class TeriockJournalEntry extends mixClasses(JournalEntry, BaseDocumentMixin) {}
