import { mergeMetadata } from "../../../utils/_module.mjs";
import TimeUnitModel from "./time-unit-model.mjs";

export default class SlowExecutionTimeUnitModel extends TimeUnitModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.MODELS.Duration",
    "TERIOCK.MODELS.SlowExecutionTime",
  ];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    groupLabels: { infinite: "TERIOCK.MODELS.SlowExecutionTime.GROUPS.infinite" },
    icon: TERIOCK.DISPLAY.icons.manifest.ability.execution,
  });

  /** @inheritDoc */
  static get infiniteChoiceEntries() {
    return [{ id: "shortRest", label: "TERIOCK.TERMS.ExecutionTime.slow.shortRest" }, {
      id: "longRest",
      label: "TERIOCK.TERMS.ExecutionTime.slow.longRest",
    }];
  }
}
