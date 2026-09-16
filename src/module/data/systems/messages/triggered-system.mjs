import { mergeMetadata } from "../../../helpers/construction.mjs";
import InteractiveSystem from "./interactive-system/interactive-system.mjs";

/**
 * Chat message data model for triggered automation prompts.
 */
export default class TriggeredSystem extends InteractiveSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "triggered" });

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
