import { mix } from "../../../../helpers/construction.mjs";
import * as mixins from "../../mixins/_module.mjs";
import ApplicableSystem from "../applicable-system/applicable-system.mjs";

/**
 * Effect-specific effect data model.
 * @extends {BaseEffectSystem}
 * @extends {Teriock.Models.ImbuementSystemData}
 * @mixes GrantedSystem
 */
export default class ImbuementSystem extends mix(
  ApplicableSystem,
  mixins.GrantedSystemMixin,
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { type: "imbuement" });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      "mundane",
      "applyIfDampened",
      "applyIfShattered",
      "applyIfUnequipped",
    ];
  }
}
