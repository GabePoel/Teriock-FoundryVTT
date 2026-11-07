import { CompetenceModel } from "../../_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { BaseDataModel } from "../../../abstract/_module.mjs";
import { FormulaField } from "../../../fields/_module.mjs";
import { rollableFormulaField } from "../../../fields/tools/builders.mjs";
import { ThresholdDataMixin, UsableDataMixin } from "../../../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @import { DataModel } from "@common/abstract/data.mjs";
 */

/**
 * A data model for some rollable modifier that has a score associated with it.
 * @extends {BaseDataModel}
 * @mixes UsableData
 * @mixes ThresholdData
 */
export default class BaseModifierModel extends mixClasses(BaseDataModel, UsableDataMixin, ThresholdDataMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.BaseModifier"];

  /**
   * @inheritDoc
   * @type {Teriock.Metadata.ModifierMetadata}
   */
  static metadata = mergeMetadata(super.metadata, {
    initialBase: "",
    initialDie: "d20",
    initialMultiplier: 1,
    initialScore: 0,
  });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      base: rollableFormulaField({ initial: this.metadata.initialBase }),
      bonus: rollableFormulaField(),
      score: new fields.NumberField({
        initial: this.metadata.initialScore,
        integer: true,
        nullable: false,
        required: true,
      }),
    });
  }

  /**
   * Get a formula representing some part of a modifier roll.
   * @param {Partial<Teriock.Modifier.ModifierComponents>} [components]
   * @param {Teriock.Modifier.ModifierFormulaType} [type]
   * @param {Teriock.Modifier.ModifierFormulaFormat} [format]
   * @param {object} [rollData]
   * @returns {Teriock.System.FormulaString}
   */
  static getFormula(components = {}, type = "rollable", format = "terms", rollData = {}) {
    const {
      base = this.metadata.initialBase,
      bonus = "",
      circumstance = "",
      competence = new CompetenceModel({ raw: this.metadata.initialCompetence }),
      die = this.metadata.initialDie,
      edge = 0,
      multiplier = this.metadata.initialMultiplier,
      score = this.metadata.initialScore,
      term = "",
    } = components;
    const scoreFormula = (!multiplier || !term) ? "" : FormulaField.multiply(term, multiplier.toString());
    const mod = format === "numbers"
      ? String(BaseRoll.minValue(base || "0", rollData) + multiplier * score + competence.value)
      : FormulaField.sum(base, scoreFormula, competence.formula);
    if (type === "mod") { return mod; }
    const formula = FormulaField.sum(mod, bonus, circumstance);
    if (type === "formula" || !die) { return formula; }
    const suffix = edge > 0 ? "kh1" : edge < 0 ? "kl1" : "";
    const number = edge !== 0 ? "2" : "1";
    const dieFormula = `${number}${die}${suffix}`;
    return FormulaField.add(dieFormula, formula);
  }

  /**
   * Formula.
   * @returns {Teriock.System.FormulaString}
   */
  get formula() {
    return this.constructor.getFormula(this, "formula", "terms");
  }

  /**
   * A key identifying this executable.
   * @returns {string}
   */
  get key() {
    return this.schema.name || "";
  }

  /**
   * Mod.
   * @returns {Teriock.System.FormulaString}
   */
  get mod() {
    return this.constructor.getFormula(this, "mod", "terms");
  }

  /**
   * The name of this executable.
   * @returns {string}
   */
  get name() {
    return this.key;
  }

  /**
   * A term that represents the score in roll formulas.
   * @returns {Teriock.System.FormulaString}
   */
  get term() {
    return "";
  }

  /**
   * Evaluated roll modifier.
   * @returns {number}
   */
  get value() {
    return BaseRoll.minValue(this.constructor.getFormula(this, "mod", "numbers", this.getRollData()));
  }

  /** @inheritDoc */
  getLocalRollData() {
    return foundry.utils.mergeObject(super.getLocalRollData(), { score: this.score });
  }
}
