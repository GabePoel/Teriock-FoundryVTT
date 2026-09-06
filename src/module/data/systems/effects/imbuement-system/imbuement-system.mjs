import { mixClasses } from "../../../../helpers/construction.mjs";
import { GrantedSystemMixin } from "../../mixins/_module.mjs";
import ApplicableEffectSystem from "../applicable-effect-system/applicable-effect-system.mjs";

/**
 * Effect-specific effect data model.
 * @mixes GrantedSystem
 */
export default class ImbuementSystem extends mixClasses(ApplicableEffectSystem, GrantedSystemMixin) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { initialKind: "other", type: "imbuement" });
  }

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
