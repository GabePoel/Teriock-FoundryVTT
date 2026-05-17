import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Journal } = foundry.documents.collections;

/**
 * @implements {TypeCollection<TeriockJournalEntry, TeriockJournalEntry>}
 * @implements {DocumentCollection<TeriockJournalEntry>}
 */
export default class TeriockJournal extends BaseWorldCollectionMixin(Journal) {}
