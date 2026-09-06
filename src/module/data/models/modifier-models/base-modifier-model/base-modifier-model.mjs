import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { BaseDataModel } from "../../../abstract/_module.mjs";
import { rollableFormulaField } from "../../../fields/tools/builders.mjs";
import { ThresholdDataMixin, UsableDataMixin } from "../../../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * A data model for some rollable modifier that has a score associated with it.
 * @mixes UsableData
 * @mixes ThresholdData
 */
export default class BaseModifierModel extends mixClasses(BaseDataModel, UsableDataMixin, ThresholdDataMixin) {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      bonus: rollableFormulaField(),
      score: new fields.NumberField({ initial: 0, integer: true, nullable: false, required: true }),
    });
  }

  /**
   * A key identifying this executable.
   * @returns {string}
   */
  get key() {
    return this.schema.name || "";
  }

  /**
   * The name of this executable.
   * @returns {string}
   */
  get name() {
    return this.key;
  }

  /**
   * Evaluated roll modifier.
   * @returns {number}
   */
  get value() {
    return BaseRoll.minValue(this.bonus || "0", this.getRollData()) + this.competence?.bonus;
  }

  /** @inheritDoc */
  getLocalRollData() {
    return foundry.utils.mergeObject(super.getLocalRollData(), { score: this.score });
  }
}
