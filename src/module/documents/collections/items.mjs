import { mixClasses } from "../../helpers/construction.mjs";
import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Items } = foundry.documents.collections;

/**
 * @mixes BaseWorldCollection
 */
export default class TeriockItems extends mixClasses(Items, BaseWorldCollectionMixin) {}
