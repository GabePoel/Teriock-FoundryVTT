import { multiplyFormula } from "../../../helpers/formula.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import EvaluationModel from "../evaluation-model.mjs";

const { fields } = foundry.data;
const { DialogV2 } = foundry.applications.api;

class UnitDialog extends DialogV2 {
  /** @type {UnitModel} */
  unitModel;

  /**
   * @param {HTMLInputElement} rawInput
   * @param {string} value
   * @private
   */
  #updateInputs(rawInput, value) {
    rawInput.disabled = !this.unitModel.constructor.finiteChoiceEntries
      .map((e) => e.id)
      .includes(value);
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (this.unitModel) {
      const unitInput =
        /** @type {HTMLInputElement} */ this.element.querySelector(
          `[name="${this.unitModel.schema.fieldPath}.unit"]`,
        );
      const rawInput =
        /** @type {HTMLInputElement} */ this.element.querySelector(
          `[name="${this.unitModel.schema.fieldPath}.raw"]`,
        );
      this.#updateInputs(rawInput, unitInput.value);
      unitInput.addEventListener("change", (e) => {
        this.#updateInputs(rawInput, e.target.value);
      });
    }
  }
}

//noinspection JSClosureCompilerSyntax,JSUnusedGlobalSymbols
/**
 * @implements {Teriock.Models.UnitModelInterface}
 */
export default class UnitModel extends EvaluationModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.MODELS.Unit",
  ];

  /** @returns {Teriock.Units.UnitEntry[]} */
  static get choiceEntries() {
    return [
      ...this.zeroChoiceEntries,
      ...this.finiteChoiceEntries,
      ...this.infiniteChoiceEntries,
    ];
  }

  /**
   * Valid unit choices.
   * @returns {Record<string, string>}
   */
  static get choices() {
    return Object.fromEntries(
      this.choiceEntries.map((e) => [e.id, game.i18n.localize(e.label)]),
    );
  }

  /** @returns {Teriock.Units.UnitEntry[]} */
  static get finiteChoiceEntries() {
    return [];
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get infiniteChoiceEntries() {
    return [
      {
        id: "unlimited",
        label: game.i18n.localize("TERIOCK.MODELS.Unit.UNITS.unlimited"),
      },
    ];
  }

  /** @returns {Teriock.Units.UnitEntry[]} */
  static get zeroChoiceEntries() {
    return [];
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      unit: new fields.StringField({
        required: false,
        initial: this.choiceEntries[0].id,
        choices: this.choices,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["unit", "raw"];
  }

  /**
   * Title for update window.
   * @returns {string}
   */
  get _updateTitle() {
    return game.i18n.format("TERIOCK.MODELS.Unit.UPDATE.basic", {
      label: this.schema.label,
    });
  }

  /**
   * A text abbreviation of this.
   * @returns {string}
   */
  get abbreviation() {
    if (this.unitType === "finite") {
      return `${this.formula} ${this.symbol}`;
    }
    return this.text;
  }

  /**
   * The conversion factor for the chosen unit.
   * @returns {number}
   */
  get conversion() {
    const unitType = this.unitType;
    if (unitType === "zero") return 0;
    if (unitType === "infinite") return Infinity;
    else {
      return (
        this.constructor.finiteChoiceEntries.find((e) => e.id === this.unit)
          .conversion || 1
      );
    }
  }

  /** @inheritDoc */
  get currentValue() {
    return this.#convert(super.currentValue);
  }

  /** @inheritDoc */
  get formula() {
    const unitType = this.unitType;
    if (unitType === "zero") return "0";
    if (unitType === "infinite") return "9".repeat(32);
    else {
      const conversion = this.conversion;
      if (conversion === 1) return super.formula;
      else return multiplyFormula(super.formula, conversion.toString());
    }
  }

  /**
   * An icon for this unit model.
   * @returns {string}
   */
  get icon() {
    return "pen-to-square";
  }

  /**
   * An abbreviation for the unit.
   * @returns {string}
   */
  get symbol() {
    return (
      this.constructor.choiceEntries.find((e) => e.id === this.unit).symbol ||
      this.unit
    );
  }

  /** @inheritDoc */
  get text() {
    if (this.unitType === "finite") {
      const entry = this.constructor.finiteChoiceEntries.find(
        (e) => e.id === this.unit,
      );
      return `${this.raw} ${this.raw === "1" ? game.i18n.localize(entry.label) : game.i18n.localize(entry.plural)}`;
    } else {
      return this.constructor.choices[this.unit];
    }
  }

  /**
   * What type of unit this is.
   * @returns {"zero" | "finite" | "infinite"}
   */
  get unitType() {
    if (
      this.constructor.zeroChoiceEntries.map((e) => e.id).includes(this.unit)
    ) {
      return "zero";
    } else if (
      this.constructor.finiteChoiceEntries.map((e) => e.id).includes(this.unit)
    ) {
      return "finite";
    } else {
      return "infinite";
    }
  }

  /** @inheritDoc */
  get value() {
    return this.#convert(super.value);
  }

  /**
   * Convert to the base numerical unit.
   * @param {number} value
   * @returns {number}
   */
  #convert(value) {
    const unitType = this.unitType;
    if (unitType === "zero") return 0;
    if (unitType === "infinite") return Infinity;
    else return value;
  }

  /**
   * Convert the current to a given unit.
   * @param {string} unit
   * @returns {number}
   */
  convertTo(unit) {
    const unitType = this.unitType;
    if (unitType !== "finite") return this.currentValue;
    return (
      (this.constructor.finiteChoiceEntries.find((e) => e.id === unit)
        .conversion || 1) * this.currentValue
    );
  }

  /**
   * Dialog to update this unit.
   * @returns {Promise<void>}
   */
  async updateDialog() {
    const group = await this.getEditor();
    const document = this.document;
    const dialog = new UnitDialog({
      buttons: [
        {
          action: "update",
          label: game.i18n.localize("TERIOCK.DIALOGS.Update.BUTTONS.update"),
          default: true,
          icon: makeIconClass("check", "button"),
          /**
           * @param {PointerEvent} _event
           * @param {HTMLButtonElement} button
           */
          callback: async function (_event, button) {
            const namedElements = /** @type {HTMLInputElement[]} */ Array.from(
              button.form.elements,
            ).filter((el) => el.hasAttribute("name"));
            const updateData = Object.fromEntries(
              namedElements.map((el) => [
                el.getAttribute("name"),
                el.type === "checkbox" ? el.checked : el.value,
              ]),
            );
            await document.update(updateData);
          },
        },
      ],
      content: group.outerHTML,
      position: {
        width: 500,
      },
      window: {
        title: this._updateTitle,
        icon: makeIconClass(this.icon, "title"),
      },
    });
    dialog.unitModel = this;
    await dialog.render(true);
  }
}
