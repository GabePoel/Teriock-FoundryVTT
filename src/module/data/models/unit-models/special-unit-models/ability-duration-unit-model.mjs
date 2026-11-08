import { mergeMetadata } from "../../../../utils/_module.mjs";
import EffectDurationUnitModel from "./effect-duration-unit-model.mjs";

export default class AbilityDurationUnitModel extends EffectDurationUnitModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.Duration"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { icon: TERIOCK.DISPLAY.icons.manifest.ability.duration });

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get infiniteChoiceEntries() {
    return [...super.infiniteChoiceEntries, { id: "passive", label: "TERIOCK.MODELS.Duration.UNITS.passive" }];
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get zeroChoiceEntries() {
    return [{ id: "instant", label: "TERIOCK.MODELS.Duration.UNITS.instant" }];
  }

  /** @inheritDoc */
  get label() {
    if (this.unit === "passive") { return _loc("TERIOCK.MODELS.Duration.UNITS.alwaysActive"); }
    return super.label;
  }

  /** @inheritDoc */
  prepareUpdaterContext() {
    return { ...super.prepareUpdaterContext(), abbreviation: "", data: this.label, source: this.clone().label };
  }
}
