import { mixClasses } from "../../../helpers/construction.mjs";
import { EvaluationModel } from "../../abstract/_module.mjs";
import { initialString } from "../../fields/tools/initializers.mjs";
import * as dataMixins from "../../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * A data model for some rollable modifier that has a score associated with it.
 * @extends {EvaluationModel}
 * @extends {Teriock.Models.BaseModifierModelData}
 * @mixes ThresholdData
 * @mixes UsableData
 */
export default class BaseModifierModel
  extends mixClasses(EvaluationModel, dataMixins.UsableDataMixin, dataMixins.ThresholdDataMixin)
{
  /** @inheritDoc */
  static defineSchema(options = {}) {
    return Object.assign(super.defineSchema(options), {
      _key: initialString(),
      score: new fields.NumberField({ initial: options.score ?? 0, integer: true, nullable: false }),
    });
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
  get currentValue() {
    return this.#modify(super.currentValue);
  }

  /**
   * A key identifying this executable.
   * @returns {string}
   */
  get key() {
    return this._key || "";
  }

  /**
   * The name of this executable.
   * @returns {string}
   */
  get name() {
    return this.schema.fields.raw.label;
  }

  /** @inheritDoc */
  get value() {
    return this.#modify(super.value);
  }

  /** @inheritDoc */
  getLocalRollData() {
    return foundry.utils.mergeObject(super.getLocalRollData(), { "": this.value, score: this.score });
  }
}
