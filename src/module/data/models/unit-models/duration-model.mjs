import TimeUnitModel from "./time-unit-model.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * @implements {Teriock.Models.DurationModelInterface}
 */
export default class DurationModel extends TimeUnitModel {
  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get infiniteChoiceEntries() {
    return [
      ...super.infiniteChoiceEntries,
      {
        id: "passive",
        label: "Passive",
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
        label: "Instant",
      },
    ];
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      conditions: new fields.SchemaField({
        present: new fields.SetField(
          new fields.StringField({ choices: TERIOCK.index.conditions }),
          {
            label: "Present Conditions",
            hint: "What conditions must be present in order for this ability to be active?",
          },
        ),
        absent: new fields.SetField(
          new fields.StringField({ choices: TERIOCK.index.conditions }),
          {
            label: "Absent Conditions",
            hint: "What conditions must be absent in order for this ability to be active?",
          },
        ),
      }),
      dawn: new fields.BooleanField({
        label: "Dawn",
        hint: "Does the effect expire at dawn?",
      }),
      stationary: new fields.BooleanField({
        label: "Stationary",
        hint: "Do you need to be stationary for this ability to be active?",
      }),
      description: new fields.StringField({
        label: "Description",
        hint: "Optional description that overrides the default duration text.",
      }),
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
    return "hourglass";
  }

  /**
   * String of all the prerequisites.
   * @returns {string}
   */
  get prerequisiteString() {
    const parts = [];
    if (this.stationary) parts.push("Stationary");
    parts.push(
      ...this.conditions.present.map((c) => TERIOCK.index.conditions[c]),
    );
    parts.push(
      ...this.conditions.absent.map((c) =>
        `Not ${TERIOCK.index.conditions[c]}`
          .replace("Not Down", "Up")
          .replace("Not Dead", "Alive")
          .replace("Not Unconscious", "Conscious"),
      ),
    );
    if (parts.length > 1) parts.push("and " + parts.pop());
    let out = "";
    if (parts.length >= 1) {
      out = `While ${parts.join(parts.length > 2 ? ", " : " ")}`;
    }
    if (this.dawn) out = `Until Dawn ${out}`;
    return out.trim();
  }

  /** @inheritDoc */
  get text() {
    if (this.description) return this.description;
    const s = this.prerequisiteString;
    let text = super.text;
    if (s.length > 1) {
      if (this.unit === "passive") text = "";
      return `${text} ${s}`;
    }
    if (this.unit === "passive") text = "Always Active";
    return text;
  }
}
