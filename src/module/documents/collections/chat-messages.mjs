import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { ChatMessages } = foundry.documents.collections;

/**
 * @import { DocumentCollection } from "@client/documents/abstract/_module.mjs";
 */

/**
 * @extends {ChatMessages}
 * @mixes BaseWorldCollection
 * @implements {TypeCollection<TeriockChatMessage, TeriockChatMessage>}
 * @implements {DocumentCollection<TeriockChatMessage>}
 */
export default class TeriockChatMessages extends BaseWorldCollectionMixin(ChatMessages) {}
