import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { ChatMessages } = foundry.documents.collections;

/**
 * @implements {TypeCollection<TeriockChatMessage, TeriockChatMessage>}
 * @implements {DocumentCollection<TeriockChatMessage>}
 */
export default class TeriockChatMessages extends BaseWorldCollectionMixin(ChatMessages) {}
