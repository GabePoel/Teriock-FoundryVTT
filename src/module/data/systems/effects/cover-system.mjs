import { mergeMetadata } from "../../../utils/_module.mjs";
import { BaseEffectSystem } from "./abstract/_module.mjs";

export default class CoverSystem extends BaseEffectSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.cover.full,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.cover,
    type: "cover",
  });
}
