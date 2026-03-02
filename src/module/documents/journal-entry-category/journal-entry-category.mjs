import { mix } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { JournalEntryCategory } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock JournalEntryCategory implementation.
 * @implements {Teriock.Documents.JournalEntryCategoryInterface}
 * @extends {ClientDocument}
 * @extends {JournalEntryCategory}
 * @mixes BaseDocument
 */
export default class TeriockJournalEntryCategory extends mix(
  JournalEntryCategory,
  mixins.BaseDocumentMixin,
) {}
