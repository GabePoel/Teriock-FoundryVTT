import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Items } = foundry.documents.collections;

//noinspection JSClosureCompilerSyntax
/**
 * @extends {Items}
 * @implements {TypeCollection<TeriockItem, TeriockItem>}
 * @implements {WorldCollection<TeriockItem>}
 * @mixes BaseWorldCollection
 */
export default class TeriockItems extends BaseWorldCollectionMixin(Items) {}
