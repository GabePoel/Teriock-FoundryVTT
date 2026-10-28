import { mergeMetadata } from "../../../utils/_module.mjs";
import { CharacterActorSystem } from "./abstract/_module.mjs";

/**
 * Player character actor data model.
 */
export default class PlayerCharacterSystem extends CharacterActorSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    defaultChildIdentifiers: [...super.metadata.defaultChildIdentifiers, "resource:agency-spark"],
    icon: TERIOCK.DISPLAY.icons.manifest.document.pc,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.pc,
    type: "pc",
  });
}
