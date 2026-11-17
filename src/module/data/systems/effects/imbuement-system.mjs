import { mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
import { GrantedSystemMixin } from "../mixins/_module.mjs";
import { ExecutedEffectSystem } from "./abstract/_module.mjs";

/**
 * Effect-specific effect data model.
 * @extends {ExecutedEffectSystem}
 * @mixes GrantedSystem
 */
export default class ImbuementSystem extends mixClasses(ExecutedEffectSystem, GrantedSystemMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.document.imbuement,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.imbuement,
    initialKind: "other",
    type: "imbuement",
  });

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, {
      legend: "TERIOCK.COMMON.Suppression",
      paths: ["applyIfDampened", "applyIfDeattuned", "applyIfDestroyed", "applyIfShattered", "applyIfUnequipped"],
    }];
  }
}
