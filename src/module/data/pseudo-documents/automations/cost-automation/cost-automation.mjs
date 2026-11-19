import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { mergeMetadata, objectMap } from "../../../../utils/_module.mjs";
import { FormulaField } from "../../../fields/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

export default class CostAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Cost"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { ability: true }, type: "cost" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      costs: new fields.SchemaField(objectMap(TERIOCK.CONFIG.stat, v =>
        new FormulaField({
          hint: _loc("TERIOCK.AUTOMATIONS.Cost.FIELDS.costs.hint"),
          label: _loc(v.label),
          placeholder: "@base",
        }))),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...Object.keys(TERIOCK.CONFIG.stat).map(k => `costs.${k}`), ...super._formPaths];
  }

  /**
   * Stats whose costs this modifies.
   * @returns {Teriock.Keys.Stat[]}
   */
  get stats() {
    return Object.keys(this.costs).filter(k => FormulaField.exists(this.costs[k]));
  }

  /**
   * Modify the cost of a stat.
   * @param {Teriock.Keys.Stat} stat
   * @param {number} base
   * @param {object} rollData
   * @returns {Promise<number>}
   */
  async modifyCost(stat, base, rollData) {
    if (!FormulaField.exists(this.costs[stat])) { return base; }
    const formula = BaseRoll.replaceFormulaData(this.costs[stat], { base });
    return Math.max(0, await BaseRoll.getValue(formula, rollData) || 0);
  }
}
