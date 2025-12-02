import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Macros } = foundry.documents.collections;

//noinspection JSClosureCompilerSyntax
/**
 * @implements {Collection<ID<TeriockMacro>, TeriockMacro>}
 * @implements {DocumentCollection<TeriockMacro>}
 */
export default class TeriockMacros extends BaseWorldCollectionMixin(Macros) {}
