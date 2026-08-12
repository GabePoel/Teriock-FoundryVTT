import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Journal } = foundry.documents.collections;

/**
 * @import { DocumentCollection } from "@client/documents/abstract/_module.mjs";
 */

/**
 * @mixes BaseWorldCollection
 * @implements {TypeCollection<TeriockJournalEntry, TeriockJournalEntry>}
 * @implements {DocumentCollection<TeriockJournalEntry>}
 */
export default class TeriockJournal extends BaseWorldCollectionMixin(Journal) {}
