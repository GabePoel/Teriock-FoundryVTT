import { mix } from "../../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockArmament}
 * @property {TeriockArmament} document
 * @property {TeriockArmament} item
 * @mixes WikiButtonSheet
 */
export default class ArmamentSheet extends mix(
  BaseItemSheet,
  mixins.WikiButtonSheetMixin,
) {
  /** @inheritDoc */
  static BARS = ["teriock/sheets/shared/bars/armament-bars"];

  /** @inheritDoc */
  get _buttonUpdates() {
    return {
      ...super._buttonUpdates,
      ".ab-av-button": { "system.av.raw": "1" },
      ".ab-bv-button": { "system.bv.raw": "1" },
      ".ab-damage-button": { "system.damage.base": "1" },
      ".ab-hit-button": { "system.hitBonus": "1" },
      ".ab-range-button": { "system.range.long.raw": "5" },
      ".ab-short-range-button": { "system.range.short.raw": "5" },
      ".ab-two-handed-damage-button": { "system.damage.twoHanded": "1" },
    };
  }
}
