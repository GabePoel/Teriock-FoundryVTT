import { mixClasses } from "../../helpers/construction.mjs";
import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { ChatMessages } = foundry.documents.collections;

/**
 * @import { DocumentCollection } from "@client/documents/abstract/_module.mjs";
 */

/**
 * @mixes BaseWorldCollection
 * @implements {DocumentCollection<TeriockChatMessage>}
 */
export default class TeriockChatMessages extends mixClasses(ChatMessages, BaseWorldCollectionMixin) {}
