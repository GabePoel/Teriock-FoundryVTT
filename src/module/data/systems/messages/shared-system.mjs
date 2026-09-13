import { mergeMetadata } from "../../../helpers/construction.mjs";
import InteractiveSystem from "./interactive-system/interactive-system.mjs";

/**
 * Chat message data model for shared information.
 */
export default class SharedSystem extends InteractiveSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "shared" });
}
