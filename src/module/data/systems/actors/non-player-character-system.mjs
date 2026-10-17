import { mergeMetadata } from "../../../utils/_module.mjs";
import PlayableCharacterSystem from "./playable-character-system.mjs";

/**
 * Non-player character actor data model.
 */
export default class NonPlayerCharacterSystem extends PlayableCharacterSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { defaultChildIdentifiers: ["rank:journeyman"], type: "npc" });
}
