import { systemPath } from "../../../helpers/path.mjs";
import { mix } from "../../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockArmament}
 * @property {TeriockArmament} document
 * @property {TeriockArmament} item
 * @mixes UseButtonSheet
 * @mixes WikiButtonSheet
 */
export default class ArmamentSheet extends mix(
  BaseItemSheet,
  mixins.UseButtonSheetMixin,
  mixins.WikiButtonSheetMixin,
) {
  /** @inheritDoc */
  static BARS = [systemPath("templates/sheets/shared/bars/armament-bars.hbs")];

  /** @inheritDoc */
  get _buttonUpdates() {
    return {
      ...super._buttonUpdates,
      ".ab-damage-button": { "system.damage.base.raw": "1" },
      ".ab-av-button": { "system.av.raw": "1" },
      ".ab-bv-button": { "system.bv.raw": "1" },
      ".ab-hit-button": { "system.hit.raw": "1" },
    };
  }
}
