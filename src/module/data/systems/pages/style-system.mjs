import { mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
import { WikiSystemMixin } from "../mixins/_module.mjs";
import BasePageSystem from "./base-page-system/base-page-system.mjs";

/**
 * Rules text for a weapon fighting style.
 * @extends {BasePageSystem}
 * @mixes WikiSystem
 */
export default class StyleSystem extends mixClasses(BasePageSystem, WikiSystemMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.document.style,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.style,
    type: "style",
  });
}
