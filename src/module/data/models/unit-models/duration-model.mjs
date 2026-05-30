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
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.Duration"];

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get infiniteChoiceEntries() {
    return [...super.infiniteChoiceEntries, { id: "passive", label: "TERIOCK.MODELS.Duration.UNITS.passive" }];
  }

  /**
   * Trigger choices.
   * @returns {Record<string, FormSelectOption>}
   */
  static get triggerChoices() {
    return formatDynamicSelectOptions({
      activity: TERIOCK.config.trigger.activity,
      combat: TERIOCK.config.trigger.combat,
      consequence: TERIOCK.config.trigger.consequence,
      execution: TERIOCK.config.trigger.execution,
      impact: TERIOCK.config.trigger.impact,
      time: TERIOCK.config.trigger.time,
    }, { localize: true });
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get zeroChoiceEntries() {
    return [{ id: "instant", label: "TERIOCK.MODELS.Duration.UNITS.instant" }];
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      conditions: conditionRequirementsField(),
      description: new fields.StringField(),
      triggers: new fields.SetField(new fields.StringField({ choices: this.triggerChoices })),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, "conditions.present", "conditions.absent", "triggers", "description"];
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
    const triggers = [...this.triggers.map(t => DurationModel.triggerChoices[t].label)];
    const notDead = _loc("TERIOCK.FORMAT.invert", { value: TERIOCK.reference.conditions.dead });
    const notDown = _loc("TERIOCK.FORMAT.invert", { value: TERIOCK.reference.conditions.down });
    const notUnconscious = _loc("TERIOCK.FORMAT.invert", { value: TERIOCK.reference.conditions.unconscious });
    const conditions = [
      ...this.conditions.present.map(c => TERIOCK.reference.conditions[c]),
      ...this.conditions.absent.map(c =>
        _loc("TERIOCK.FORMAT.invert", { value: TERIOCK.reference.conditions[c] }).replace(
          notDead,
          _loc("TERIOCK.STATUSES.Conditions.alive"),
        ).replace(notDown, _loc("TERIOCK.STATUSES.Conditions.up")).replace(
          notUnconscious,
          _loc("TERIOCK.STATUSES.Conditions.conscious"),
        )
      ),
    ].filter(Boolean);
    let triggerPart = _loc("TERIOCK.MODELS.Duration.PREREQUISITES.untilTriggers", {
      partial: listFormat(triggers, { type: "disjunction" }),
    });
    let conditionsPart = _loc("TERIOCK.MODELS.Duration.PREREQUISITES.ongoing", {
      partial: listFormat(conditions, { sort: false }),
    });
    if (triggers.length === 0) { triggerPart = ""; }
    if (conditions.length === 0) { conditionsPart = ""; }
    return _loc("TERIOCK.MODELS.Duration.PREREQUISITES.text", { end: conditionsPart, start: triggerPart }).trim();
  }

  /** @inheritDoc */
  get text() {
    if (this.description) { return this.description; }
    const prerequisite = this.prerequisiteString;
    let duration = super.text;
    if (prerequisite.length > 1) {
      if (prerequisite.length > 0 && this.unit === "unlimited") { duration = ""; }
      if (this.unit === "passive") { duration = ""; }
      return _loc("TERIOCK.MODELS.Duration.PREREQUISITES.text", { end: prerequisite, start: duration });
    }
    if (this.unit === "passive") { duration = _loc("TERIOCK.MODELS.Duration.UNITS.alwaysActive"); }
    return duration;
  }
}
