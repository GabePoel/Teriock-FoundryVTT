import { mergeMetadata } from "../../../utils/_module.mjs";
import BaseGroupSystem from "./base-group-system/base-group-system.mjs";

/**
 * A bunch of guys that share the same turn.
 * @category Groups
 */
export default class MobSystem extends BaseGroupSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.document.mob,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.mob,
    type: "mob",
  });
}
