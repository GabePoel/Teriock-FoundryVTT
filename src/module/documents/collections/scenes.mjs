import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Scenes } = foundry.documents.collections;

//noinspection JSClosureCompilerSyntax
/**
 * @implements {Collection<Teriock.ID<TeriockScene>, TeriockScene>}
 * @implements {DocumentCollection<TeriockScene>}
 * @property {TeriockScene|null} activeGM
 */
export default class TeriockScenes extends BaseWorldCollectionMixin(Scenes) {}
