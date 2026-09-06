import { mixClasses } from "../../helpers/construction.mjs";
import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Folders } = foundry.documents.collections;

/**
 * @import { DocumentCollection } from "@client/documents/abstract/_module.mjs";
 */

/**
 * @mixes BaseWorldCollection
 * @implements {DocumentCollection<TeriockFolder>}
 */
export default class TeriockFolders extends mixClasses(Folders, BaseWorldCollectionMixin) {}
