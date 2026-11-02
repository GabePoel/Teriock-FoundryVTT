import { mergeMetadata } from "../../../utils/_module.mjs";
import BaseUnitModel from "./base-unit-model/base-unit-model.mjs";

export default class CurrencyUnitModel extends BaseUnitModel {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { unitConfig: "currency", unlimited: false });

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get zeroChoiceEntries() {
    return [{ id: "none", label: "TERIOCK.MODELS.CurrencyUnit.UNITS.none.label" }];
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.DISPLAY.icons.manifest.stat.gp;
  }
}
