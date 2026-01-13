import { toCamelCase, toTitleCase } from "../../../helpers/string.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import { UsableDataMixin } from "../../shared/mixins/_module.mjs";
import EvaluationModel from "../evaluation-model.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax,JSUnusedGlobalSymbols
/**
 * @mixes UsableData
 * @extends EvaluationModel
 * @implements {Teriock.Models.ModifierModelInterface}
 * @property {number} score - The modifier score.
 */
export default class ModifierModel extends UsableDataMixin(EvaluationModel) {
  /** @inheritDoc */
  static defineSchema(options = {}) {
    const { score = 0 } = options;
    return {
      ...super.defineSchema(options),
      score: new fields.NumberField({ initial: score }),
    };
  }

  /** @inheritDoc */
  static migrateData(data) {
    if (typeof data.score === "object") {
      data.score = Number(data.score?.saved) || 0;
    }
    return super.migrateData(data);
  }

  /** @inheritDoc */
  get currentValue() {
    return this.#modify(super.currentValue);
  }

  /**
   * Class to use in icons for this modifier's competence.
   * @returns {string}
   */
  get iconClass() {
    if (this.competence.fluent) return makeIconClass("circle-dot", "solid");
    if (this.competence.proficient)
      return makeIconClass("circle-dot", "regular");
    return makeIconClass("circle", "regular");
  }

  /**
   * A key identifying this executable.
   * @returns {string}
   */
  get key() {
    return toCamelCase(this.schema.fields.raw.label);
  }

  /**
   * The name of this executable.
   * @returns {string}
   */
  get name() {
    return toTitleCase(this.schema.fields.raw.label);
  }

  /** @inheritDoc */
  get quickValue() {
    return this.score;
  }

  /** @inheritDoc */
  get value() {
    return this.#modify(super.value);
  }

  /**
   * Modify a value with proficiency and fluency.
   * @param {number} value
   * @returns {number}
   */
  #modify(value) {
    return value + this.competence.bonus;
  }

  /** @inheritDoc */
  getLocalRollData() {
    return foundry.utils.mergeObject(super.getLocalRollData(), {
      "": this.value,
    });
  }
}
