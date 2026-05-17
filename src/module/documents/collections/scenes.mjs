import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Scenes } = foundry.documents.collections;

/**
 * @implements {TypeCollection<TeriockScene, TeriockScene>}
 * @implements {DocumentCollection<TeriockScene>}
 * @property {TeriockScene|null} viewed
 * @extends {Scenes}
 */
export default class TeriockScenes extends BaseWorldCollectionMixin(Scenes) {}
