import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Items } = foundry.documents.collections;

//noinspection JSClosureCompilerSyntax
/**
 * @extends {Items}
 * @extends {WorldCollection<TeriockItem>}
 * @mixes BaseWorldCollection
 */
export default class TeriockItems extends BaseWorldCollectionMixin(Items) {}
