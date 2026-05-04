import { listFormat } from "../../../helpers/localization.mjs";
import { formatDynamicSelectOptions } from "../../../helpers/utils.mjs";
import { conditionRequirementsField } from "../../fields/helpers/builders.mjs";
import TimeUnitModel from "./time-unit-model.mjs";

const { fields } = foundry.data;

/**
 * @extends {Teriock.Models.DurationModelData}
 */
export default class DurationModel extends TimeUnitModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.MODELS.Duration",
  ];

  /**
   * Trigger choices.
   * @returns {Record<string, FormSelectOption>}
   */
  static get _triggerChoices() {
    return formatDynamicSelectOptions(
      {
        activity: TERIOCK.config.trigger.activity,
        combat: TERIOCK.config.trigger.combat,
        consequence: TERIOCK.config.trigger.consequence,
        execution: TERIOCK.config.trigger.execution,
        impact: TERIOCK.config.trigger.impact,
        time: TERIOCK.config.trigger.time,
      },
      { localize: true },
    );
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get infiniteChoiceEntries() {
    return [
      ...super.infiniteChoiceEntries,
      {
        id: "passive",
        label: "TERIOCK.MODELS.Duration.UNITS.passive",
      },
    ];
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get zeroChoiceEntries() {
    return [
      {
        id: "instant",
        label: "TERIOCK.MODELS.Duration.UNITS.instant",
      },
    ];
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      conditions: conditionRequirementsField(),
      description: new fields.StringField(),
      triggers: new fields.SetField(
        new fields.StringField({ choices: this._triggerChoices }),
      ),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      ...super._formPaths,
      "conditions.present",
      "conditions.absent",
      "triggers",
      "description",
    ];
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.ability.duration;
  }

  /**
   * String of all the prerequisites.
   * @returns {string}
   */
  get prerequisiteString() {
    const triggers = [
      ...this.triggers.map((t) => DurationModel._triggerChoices[t].label),
    ];
    const conditions = [
      ...this.conditions.present.map((c) => TERIOCK.reference.conditions[c]),
      // TODO: Localize the "Not" replacements.
      ...this.conditions.absent.map((c) =>
        game.i18n
          .format("TERIOCK.MODELS.Duration.PREREQUISITES.notStatus", {
            status: TERIOCK.reference.conditions[c],
          })
          .replace("Not Down", "Up")
          .replace("Not Dead", "Alive")
          .replace("Not Unconscious", "Conscious"),
      ),
    ];
    let triggerPart = _loc(
      "TERIOCK.MODELS.Duration.PREREQUISITES.untilTriggers",
      { partial: listFormat(triggers, { type: "disjunction" }) },
    );
    let conditionsPart = _loc("TERIOCK.MODELS.Duration.PREREQUISITES.ongoing", {
      partial: listFormat(conditions, { sort: false }),
    });
    if (triggers.length === 0) triggerPart = "";
    if (conditions.length === 0) conditionsPart = "";
    return game.i18n
      .format("TERIOCK.MODELS.Duration.PREREQUISITES.text", {
        start: triggerPart,
        end: conditionsPart,
      })
      .trim();
  }

  /** @inheritDoc */
  get text() {
    if (this.description) return this.description;
    let prerequisite = this.prerequisiteString;
    let duration = super.text;
    if (prerequisite.length > 1) {
      if (prerequisite.length > 0 && this.unit === "unlimited") duration = "";
      if (this.unit === "passive") duration = "";
      return _loc("TERIOCK.MODELS.Duration.PREREQUISITES.text", {
        start: duration,
        end: prerequisite,
      });
    }
    if (this.unit === "passive")
      duration = _loc("TERIOCK.MODELS.Duration.UNITS.alwaysActive");
    return duration;
  }
}
