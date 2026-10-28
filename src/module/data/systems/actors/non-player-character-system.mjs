import { mergeMetadata } from "../../../utils/_module.mjs";
import { CharacterActorSystem } from "./abstract/_module.mjs";

/**
 * Non-player character actor data model.
 */
export default class NonPlayerCharacterSystem extends CharacterActorSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.document.npc,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.npc,
    type: "npc",
  });
}
