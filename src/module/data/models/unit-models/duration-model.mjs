import { pseudoHooks } from "../../../constants/system/_module.mjs";
import { formatJoin } from "../../../helpers/string.mjs";
import { conditionRequirementsField } from "../../fields/helpers/builders.mjs";
import TimeUnitModel from "./time-unit-model.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * @implements {Teriock.Models.DurationModelInterface}
 */
export default class DurationModel extends TimeUnitModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.MODELS.Duration",
  ];

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
        new fields.StringField({ choices: pseudoHooks.actor }),
      ),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    if (data.dawn) {
      if (!data.triggers) data.triggers = [];
      data.triggers.push("dawn");
    }
    if (data.stationary) {
      if (!data.triggers) data.triggers = [];
      data.triggers.push("movement");
    }
    return super.migrateData(data);
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
    const triggers = [...this.triggers.map((t) => pseudoHooks.all[t])];
    const conditions = [
      ...this.conditions.present.map((c) => TERIOCK.reference.conditions[c]),
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
    let triggerPart = game.i18n.format(
      "TERIOCK.MODELS.Duration.PREREQUISITES.untilTriggers",
      { partial: formatJoin(triggers, true) },
    );
    let conditionsPart = game.i18n.format(
      "TERIOCK.MODELS.Duration.PREREQUISITES.ongoing",
      { partial: formatJoin(conditions, false) },
    );
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
      return game.i18n.format("TERIOCK.MODELS.Duration.PREREQUISITES.text", {
        start: duration,
        end: prerequisite,
      });
    }
    if (this.unit === "passive")
      duration = game.i18n.localize(
        "TERIOCK.MODELS.Duration.UNITS.alwaysActive",
      );
    return duration;
  }
}
