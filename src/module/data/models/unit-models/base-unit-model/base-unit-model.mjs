import { UnitUpdater } from "../../../../applications/dialogs/updaters/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { mergeMetadata, safeInf } from "../../../../utils/_module.mjs";
import { BaseDataModel } from "../../../abstract/_module.mjs";
import FormulaField from "../../../fields/formula-field/formula-field.mjs";

const { fields } = foundry.data;

/**
 * @import { FormSelectOption } from "@client/applications/forms/fields.mjs";
 */

/**
 * Model for a formula paired with a unit of measurement.
 * @implements {Teriock.Functionality.ScalingModel}
 */
export default class BaseUnitModel extends BaseDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.BaseUnit"];

  /**
   * @inheritDoc
   * @type {Teriock.Metadata.UnitMetadata}
   */
  static metadata = mergeMetadata(super.metadata, {
    formula: false,
    groupLabels: {
      finite: "TERIOCK.MODELS.BaseUnit.GROUPS.finite",
      infinite: "TERIOCK.MODELS.BaseUnit.GROUPS.infinite",
      zero: "TERIOCK.MODELS.BaseUnit.GROUPS.zero",
    },
    icon: TERIOCK.DISPLAY.icons.manifest.ui.edit,
    rawOptions: { placeholder: "0" },
    unitConfig: null,
    unitOptions: {},
    unlimited: true,
  });

  /**
   * All unit entries, each tagged with its type.
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get choiceEntries() {
    return [
      ...this.zeroChoiceEntries.map(e => ({ ...e, type: "zero" })),
      ...this.finiteChoiceEntries.map(e => ({ ...e, type: "finite" })),
      ...this.infiniteChoiceEntries.map(e => ({ ...e, type: "infinite" })),
    ];
  }

  /**
   * Valid unit choices.
   * @returns {Record<string, FormSelectOption>}
   */
  static get choices() {
    const entries = this.choiceEntries;
    const grouped = new Set(entries.map(e => e.type)).size > 1;
    return Object.fromEntries(
      entries.map(
        e => [e.id, { group: grouped ? _loc(this.metadata.groupLabels[e.type]) : undefined, label: _loc(e.label) }]
      ),
    );
  }

  /** @returns {Teriock.Units.UnitEntry[]} */
  static get finiteChoiceEntries() {
    const config = this.metadata.unitConfig;
    if (!config) { return []; }
    return Object.entries(TERIOCK.CONFIG[config]).map(([id, { conversion, label, plural, scale, symbol, system }]) => ({
      conversion,
      id,
      label,
      plural,
      scale,
      symbol,
      system,
    }));
  }

  /** @returns {Teriock.Units.UnitEntry[]} */
  static get infiniteChoiceEntries() {
    return this.metadata.unlimited ? [{ id: "unlimited", label: "TERIOCK.MODELS.BaseUnit.UNITS.unlimited" }] : [];
  }

  /** @returns {Teriock.Units.UnitEntry[]} */
  static get zeroChoiceEntries() {
    return [];
  }

  /** @inheritDoc */
  static defineSchema() {
    const { placeholder, ...options } = this.metadata.rawOptions;
    const rawOptions = { ...options, placeholder: _loc(placeholder) };
    return {
      raw: this.metadata.formula
        ? new FormulaField(rawOptions)
        : new fields.NumberField({ initial: 0, min: 0, nullable: false, ...rawOptions }),
      unit: new fields.StringField({
        choices: this.choices,
        initial: this.choiceEntries[0].id,
        nullable: false,
        required: true,
        ...this.metadata.unitOptions,
      }),
    };
  }

  /**
   * Migrate a numerical value to a unit data object.
   * @param {number} value
   * @returns {{ raw: Teriock.System.FormulaString | number, unit: string }}
   */
  static migrateNumberToUnit(value) {
    const entries = this.finiteChoiceEntries;
    const unit = (entries.find(e => (e.conversion ?? 1) === 1) ?? entries[0]).id;
    return { raw: this.metadata.formula ? String(value) : value, unit };
  }

  /**
   * Derive the value in the base unit.
   * @param {object} [rollData]
   * @returns {number}
   */
  #evaluate(rollData = {}) {
    const unitType = this.unitType;
    if (unitType === "zero") { return 0; }
    if (unitType === "infinite") { return Infinity; }
    const value = this.metadata.formula ? this.#evaluateFormula(rollData) : this.#evaluateNumber();
    return value.toNearest(TERIOCK.CONST.UNIT_PRECISION);
  }

  /**
   * Derive the value of the formula.
   * @param {object} [rollData]
   * @returns {number}
   */
  #evaluateFormula(rollData = {}) {
    return BaseRoll.minValue(this.formula, rollData);
  }

  /**
   * Derive the value of the number.
   * @returns {number}
   */
  #evaluateNumber() {
    return (this.raw ?? 0) * this.conversion;
  }

  /**
   * The conversion factor for the chosen unit.
   * @returns {number}
   */
  get conversion() {
    const unitType = this.unitType;
    if (unitType === "zero") { return 0; }
    if (unitType === "infinite") { return Infinity; }
    return this.entry.conversion || 1;
  }

  /**
   * Formula value in the chosen unit.
   * @returns {string}
   */
  get converted() {
    if (this.unitType !== "finite") { return String(this.value); }
    if (this.metadata.formula) { return this.raw || "0"; }
    return String((this.value / this.conversion).toNearest(TERIOCK.CONST.UNIT_PRECISION));
  }

  /**
   * The entry for the chosen unit.
   * @returns {Teriock.Units.UnitEntry|undefined}
   */
  get entry() {
    return this.constructor.choiceEntries.find(e => e.id === this.unit);
  }

  /**
   * The plain formula including unit conversion.
   * @returns {Teriock.System.FormulaString}
   */
  get formula() {
    const unitType = this.unitType;
    if (unitType === "zero") { return "0"; }
    if (unitType === "infinite") { return TERIOCK.CONST.INF.toString(); }

    if (!this.metadata.formula) { return String(this.#evaluateNumber()); }
    const formula = this.raw || "0";
    const conversion = this.conversion;
    if (conversion === 1) { return formula; }
    return FormulaField.multiply(formula, conversion.toString());
  }

  /** @inheritDoc */
  get icon() {
    return this.constructor.metadata.icon;
  }

  /** @inheritDoc */
  get label() {
    const entry = this.entry;
    if (entry?.type !== "finite") { return entry ? _loc(entry.label) : ""; }
    return _loc("TERIOCK.MODELS.BaseUnit.FORMAT", { number: this.converted, unit: this.unitLabel });
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Metadata.UnitMetadata}
   */
  get metadata() {
    return this.constructor.metadata;
  }

  /**
   * Evaluated value that's safe to use in roll data. Unlimited values are capped to a safe finite number.
   * @returns {number}
   */
  get rollValue() {
    return safeInf(this.#evaluate());
  }

  /**
   * An abbreviation for the unit.
   * @returns {string}
   */
  get symbol() {
    return this.entry?.symbol || this.unit;
  }

  /**
   * Text that represents this in its chosen unit with the symbol.
   * @returns {string}
   */
  get tag() {
    if (this.unitType !== "finite") { return this.label; }
    return _loc("TERIOCK.MODELS.BaseUnit.FORMAT", { number: this.converted, unit: _loc(this.symbol) });
  }

  /**
   * Slightly longer form of {@link tag}.
   * @returns {string}
   */
  get unitLabel() {
    const entry = this.entry;
    if (entry?.type !== "finite") { return this.label; }
    return _loc(Number(this.converted) === 1 ? entry.label : entry.plural);
  }

  /**
   * What type of unit this is.
   * @returns {"zero" | "finite" | "infinite"}
   */
  get unitType() {
    return this.entry?.type ?? "infinite";
  }

  /**
   * Value derived from current roll data in base unit.
   * @returns {number}
   */
  get value() {
    return this.#evaluate(this.metadata.formula ? this.getRollData() : {});
  }

  /** @inheritDoc */
  prepareUpdaterContext() {
    const finite = this.unitType === "finite";
    const source = this.clone();
    return {
      abbreviation: finite ? _loc(this.symbol) : "",
      abbreviationTooltip: finite ? this.unitLabel : "",
      action: "updateUnit",
      data: finite ? String(this.raw ?? "") : this.label,
      dataset: { path: this.schema.fieldPath },
      locked: this.schema.isLocked(this.getNearestDocument()),
      source: source.unitType === "finite" ? String(source.raw ?? "") : source.label,
    };
  }

  /**
   * Dialog to update this unit.
   * @returns {Promise<void>}
   */
  async updateDialog() {
    await UnitUpdater.create({ document: this.getNearestDocument(), path: this.schema.fieldPath, unitModel: this });
  }
}
