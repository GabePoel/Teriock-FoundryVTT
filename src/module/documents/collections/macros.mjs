import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Macros } = foundry.documents.collections;

/**
 * @import { DocumentCollection } from "@client/documents/abstract/_module.mjs";
 */

/**
 * @extends {Macros}
 * @mixes BaseWorldCollection
 * @implements {TypeCollection<TeriockMacro, TeriockMacro>}
 * @implements {DocumentCollection<TeriockMacro>}
 */
export default class TeriockMacros extends BaseWorldCollectionMixin(Macros) {}
