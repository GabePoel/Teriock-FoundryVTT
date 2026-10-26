import { mergeMetadata } from "../../../utils/_module.mjs";
import InteractiveSystem from "./interactive-system/interactive-system.mjs";

/**
 * Chat message data model for triggered automation prompts.
 * @category Triggers
 */
export default class TriggeredSystem extends InteractiveSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "triggered" });

  /** @inheritDoc */
  _onUpdateTimestamp() {
    super._onUpdateTimestamp();
    if (
      this.parent.timestamp
        < Date.now() - (game.settings.get("teriock", "autoTriggerDeleteTime") ?? Infinity) * 60 * 1000
      && this.parent.isAuthor
      && this.parent.trackable
    ) {
      this.parent.delete();
    }
  }

  /** @inheritDoc */
  async _preActivateActivation(activation) {
    const yes = await super._preActivateActivation(activation);
    if (yes === false) { return false; }
    activation.actors = [this.parent.speakerActor].filter(Boolean);
  }
}
