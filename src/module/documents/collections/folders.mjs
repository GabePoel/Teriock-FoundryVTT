import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Folders } = foundry.documents.collections;

//noinspection JSClosureCompilerSyntax
/**
 * @implements {Collection<ID<TeriockFolder>, TeriockFolder>}
 * @implements {DocumentCollection<TeriockFolder>}
 */
export default class TeriockFolders extends BaseWorldCollectionMixin(Folders) {}
