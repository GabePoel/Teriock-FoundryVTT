import { mixClasses } from "../../../helpers/construction.mjs";
import * as mixins from "../mixins/_module.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockArmament}
 * @property {TeriockArmament} document
 * @property {TeriockArmament} item
 * @mixes WikiButtonSheet
 */
export default class ArmamentSheet extends mixClasses(BaseItemSheet, mixins.WikiButtonSheetMixin) {
  /** @inheritDoc */
  static BARS = ["teriock/sheets/shared/bars/armament-bars"];
}
