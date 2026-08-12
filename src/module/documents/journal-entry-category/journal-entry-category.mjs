import { mixClasses } from "../../helpers/construction.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { JournalEntryCategory } = foundry.documents;

/**
 * The Teriock JournalEntryCategory implementation.
 * @mixes BaseDocument
 */
export default class TeriockJournalEntryCategory
  extends mixClasses(JournalEntryCategory, documentMixins.BaseDocumentMixin)
{}
