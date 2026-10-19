import { icons, thumbnails } from "../../../static/display/_module.mjs";
import { mergeMetadata } from "../../../utils/_module.mjs";
import BaseGroupSystem from "./base-group-system/base-group-system.mjs";

/**
 * A bunch of guys that share the same turn.
 */
export default class MobSystem extends BaseGroupSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: icons.manifest.document.mob,
    img: thumbnails.manifest.document.mob,
    type: "mob",
  });
}
