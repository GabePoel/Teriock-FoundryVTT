import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { BaseDataModel } from "../../abstract/_module.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import * as dataMixins from "../../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * A data model for some rollable modifier that has a score associated with it.
 * @extends {BaseDataModel}
 * @extends {Teriock.Models.BaseModifierModelData}
 * @mixes ThresholdData
 * @mixes UsableData
 */
export default class BaseModifierModel
  extends mixClasses(BaseDataModel, dataMixins.UsableDataMixin, dataMixins.ThresholdDataMixin)
{
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      bonus: new FormulaField({ deterministic: false }),
      score: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
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
