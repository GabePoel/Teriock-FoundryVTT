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
      conditions: new fields.SchemaField({
        present: new fields.SetField(
          new fields.StringField({ choices: TERIOCK.reference.conditions }),
        ),
        absent: new fields.SetField(
          new fields.StringField({ choices: TERIOCK.reference.conditions }),
        ),
      }),
      dawn: new fields.BooleanField(),
      stationary: new fields.BooleanField(),
      description: new fields.StringField(),
    });
  }

  get _formPaths() {
    return [
      ...super._formPaths,
      "conditions.present",
      "conditions.absent",
      "stationary",
      "dawn",
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
    const parts = [];
    if (this.stationary)
      parts.push(
        game.i18n.localize("TERIOCK.MODELS.Duration.FIELDS.stationary.label"),
      );
    parts.push(
      ...this.conditions.present.map((c) => TERIOCK.reference.conditions[c]),
    );
    parts.push(
      ...this.conditions.absent.map((c) =>
        game.i18n
          .format("TERIOCK.MODELS.Duration.PREREQUISITES.notStatus", {
            status: TERIOCK.reference.conditions[c],
          })
          .replace("Not Down", "Up")
          .replace("Not Dead", "Alive")
          .replace("Not Unconscious", "Conscious"),
      ),
    );
    if (parts.length > 1) parts.push("and " + parts.pop());
    let out = "";
    if (parts.length >= 1) {
      out = game.i18n.format("TERIOCK.MODELS.Duration.PREREQUISITES.ongoing", {
        partial: parts.join(parts.length > 2 ? ", " : " "),
      });
    }
    if (this.dawn)
      out = game.i18n.format(
        "TERIOCK.MODELS.Duration.PREREQUISITES.untilDawn",
        { partial: out },
      );
    return out.trim();
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
        duration,
        prerequisite,
      });
    }
    if (this.unit === "passive")
      duration = game.i18n.localize(
        "TERIOCK.MODELS.Duration.UNITS.alwaysActive",
      );
    return duration;
  }
}
