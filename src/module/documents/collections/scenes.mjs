import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Scenes } = foundry.documents.collections;

/**
 * @import { DocumentCollection } from "@client/documents/abstract/_module.mjs";
 */

/**
 * @mixes BaseWorldCollection
 * @implements {TypeCollection<TeriockScene, TeriockScene>}
 * @implements {DocumentCollection<TeriockScene>}
 * @property {TeriockScene|null} viewed
 */
export default class TeriockScenes extends BaseWorldCollectionMixin(Scenes) {}
