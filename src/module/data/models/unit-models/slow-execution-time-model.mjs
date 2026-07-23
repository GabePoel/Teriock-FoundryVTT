import { TimeUnitModel } from "./_module.mjs";

export default class SlowExecutionTimeModel extends TimeUnitModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.MODELS.Duration",
    "TERIOCK.MODELS.SlowExecutionTime",
  ];

  /** @inheritDoc */
  static get infiniteChoiceEntries() {
    return [{ id: "shortRest", label: "TERIOCK.TERMS.ExecutionTime.slow.shortRest" }, {
      id: "longRest",
      label: "TERIOCK.TERMS.ExecutionTime.slow.longRest",
    }];
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.ability.execution;
  }
}
