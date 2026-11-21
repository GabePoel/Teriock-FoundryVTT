import { mergeMetadata } from "../../../../utils/_module.mjs";
import LengthUnitModel from "../normal-unit-models/length-unit-model.mjs";

export default class ArmamentRangeUnitModel extends LengthUnitModel {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { formula: true, rawOptions: { placeholder: "0" }, unlimited: true });

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get zeroChoiceEntries() {
    return [{ id: "none", label: "COMMON.None" }];
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    if (["contact", "melee", "self"].includes(source.unit)) { source.unit = "none"; }
    return super.migrateData(source, options);
  }
}
