import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Folders } = foundry.documents.collections;

/**
 * @import { DocumentCollection } from "@client/documents/abstract/_module.mjs";
 */

/**
 * @extends {Folders}
 * @mixes BaseWorldCollection
 * @implements {TypeCollection<TeriockFolder, TeriockFolder>}
 * @implements {DocumentCollection<TeriockFolder>}
 */
export default class TeriockFolders extends BaseWorldCollectionMixin(Folders) {}
