import { TimeUnitModel } from "./_module.mjs";

export default class SlowExecutionTimeModel extends TimeUnitModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.MODELS.Duration",
  ];

  /** @inheritDoc */
  static get infiniteChoiceEntries() {
    return [
      {
        id: "shortRest",
        label: "TERIOCK.TERMS.ExecutionTime.slow.shortRest",
      },
      {
        id: "longRest",
        label: "TERIOCK.TERMS.ExecutionTime.slow.longRest",
      },
    ];
  }

  /** @inheritDoc */
  get _updateTitle() {
    return game.i18n.localize("TERIOCK.MODELS.Unit.UPDATE.slowExecutionTime");
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.ability.execution;
  }
}
