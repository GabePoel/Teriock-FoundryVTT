import { icons } from "../../../constants/display/_module.mjs";
import { mergeMetadata, mixClasses } from "../../../helpers/construction.mjs";
import { GrantedSystemMixin } from "../mixins/_module.mjs";
import ApplicableEffectSystem from "./applicable-effect-system/applicable-effect-system.mjs";

/**
 * Effect-specific effect data model.
 * @extends {ApplicableEffectSystem}
 * @mixes GrantedSystem
 */
export default class ImbuementSystem extends mixClasses(ApplicableEffectSystem, GrantedSystemMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: icons.manifest.document.imbuement,
    initialKind: "other",
    type: "imbuement",
  });

  /** @inheritDoc */
  get _formPaths() {
    return [
      "applyIfDampened",
      "applyIfDeattuned",
      "applyIfDestroyed",
      "applyIfShattered",
      "applyIfUnequipped",
      ...super._formPaths,
    ];
  }
}
