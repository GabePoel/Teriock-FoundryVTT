import { mixClasses } from "../../../../helpers/construction.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
import ApplicableEffectSystem from "../applicable-effect-system/applicable-effect-system.mjs";

/**
 * Effect-specific effect data model.
 * @extends {ApplicableEffectSystem}
 * @extends {Teriock.Models.ImbuementSystemData}
 * @mixes GrantedSystem
 */
export default class ImbuementSystem extends mixClasses(ApplicableEffectSystem, systemMixins.GrantedSystemMixin) {
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
