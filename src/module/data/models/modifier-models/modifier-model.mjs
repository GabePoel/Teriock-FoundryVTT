import { toCamelCase, toTitleCase } from "../../../helpers/string.mjs";
import { prefixObject } from "../../../helpers/utils.mjs";
import { UsableDataMixin } from "../../mixins/_module.mjs";
import EvaluationModel from "../evaluation-model/evaluation-model.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * @mixes UsableData
 * @extends EvaluationModel
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
   * Whether this is fluent.
   * @returns {boolean}
   */
  get isFluent() {
    return this.fluent;
  }

  /**
   * Whether this is proficient.
   * @returns {boolean}
   */
  get isProficient() {
    return this.isFluent || this.proficient;
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
  get value() {
    return this.#modify(super.value);
  }

  /**
   * Modify a value with proficiency and fluency.
   * @param {number} value
   * @returns {number}
   */
  #modify(value) {
    if (this.isFluent) value += this.actor?.system.scaling.f;
    else if (this.isProficient) value += this.actor?.system.scaling.p;
    return value;
  }

  /**
   * @inheritDoc
   * @param {string} [prefix]
   */
  getLocalRollData(prefix) {
    const localRollData = super.getLocalRollData();
    Object.assign(localRollData, { "": this.value });
    if (!prefix) return localRollData;
    return prefixObject(localRollData, prefix);
  }
}
