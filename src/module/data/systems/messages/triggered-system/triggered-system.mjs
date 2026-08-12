import { BasePseudoDocument } from "../../../pseudo-documents/abstract/_module.mjs";
import InteractiveSystem from "../interactive-system/interactive-system.mjs";

/**
 * Chat message data model for triggered automation prompts.
 */
export default class TriggeredSystem extends InteractiveSystem {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { type: "triggered" });
  }

  /**
   * Add activations onto triggered chat message data.
   * @param {Partial<Teriock.Data.ChatMessageData>} chatData
   * @param {Activation[]} activations
   */
  static addActivations(chatData, activations) {
    if (!chatData?.system || !activations?.length) { return; }
    chatData.system.activations ??= {};
    Object.assign(chatData.system.activations, BasePseudoDocument.toCollectionObject(activations));
  }

  /**
   * Add a source document association onto triggered chat message data.
   * @param {Partial<Teriock.Data.ChatMessageData>} chatData
   * @param {TeriockDocument} document
   */
  static addAssociation(chatData, document) {
    const association = chatData?.system?.panels?.[0]?.associations?.[0];
    if (!document || !association) { return; }
    if (association.cards.some(c => c.uuid === document.uuid)) { return; }
    association.cards.push({
      img: document.img,
      makeTooltip: true,
      name: document.fullName || document.name,
      type: document.type,
      uuid: document.uuid,
    });
  }

  /** @inheritDoc */
  _onUpdateTimestamp() {
    super._onUpdateTimestamp();
    if (
      this.document.timestamp
        < Date.now() - (game.settings.get("teriock", "autoTriggerDeleteTime") ?? Infinity) * 60 * 1000
      && this.parent.trackable
    ) {
      this.parent.delete();
    }
  }
}
