import { mixClasses } from "../../helpers/construction.mjs";
import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Journal } = foundry.documents.collections;

/**
 * @import { DocumentCollection } from "@client/documents/abstract/_module.mjs";
 */

/**
 * @mixes BaseWorldCollection
 * @implements {DocumentCollection<TeriockJournalEntry>}
 */
export default class TeriockJournal extends mixClasses(Journal, BaseWorldCollectionMixin) {}
