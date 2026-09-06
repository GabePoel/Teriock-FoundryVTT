import { mixClasses } from "../../helpers/construction.mjs";
import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Macros } = foundry.documents.collections;

/**
 * @import { DocumentCollection } from "@client/documents/abstract/_module.mjs";
 */

/**
 * @mixes BaseWorldCollection
 * @implements {DocumentCollection<TeriockMacro>}
 */
export default class TeriockMacros extends mixClasses(Macros, BaseWorldCollectionMixin) {}
