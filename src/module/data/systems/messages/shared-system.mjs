import InteractiveSystem from "./interactive-system/interactive-system.mjs";

/**
 * Chat message data model for shared information.
 */
export default class SharedSystem extends InteractiveSystem {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { type: "shared" });
  }
}
