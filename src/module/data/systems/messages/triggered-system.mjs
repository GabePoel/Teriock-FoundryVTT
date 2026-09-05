import { BasePseudoDocument } from "../../pseudo-documents/abstract/_module.mjs";
import InteractiveSystem from "./interactive-system/interactive-system.mjs";

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
