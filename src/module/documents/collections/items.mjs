import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Items } = foundry.documents.collections;

//noinspection JSClosureCompilerSyntax
/**
 * @implements {Collection<ID<TeriockItem>, TeriockItem>}
 * @implements {DocumentCollection<TeriockItem>}
 */
export default class TeriockItems extends BaseWorldCollectionMixin(Items) {}
