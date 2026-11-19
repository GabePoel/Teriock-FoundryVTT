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
      tweaks: new fields.SchemaField(objectMap(TERIOCK.CONFIG.cost.tweaks, v =>
        new FormulaField({
          hint: _loc("TERIOCK.AUTOMATIONS.Cost.FIELDS.tweaks.hint"),
          label: _loc(v.label),
          placeholder: "@base",
        }))),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      ...Object.keys(TERIOCK.CONFIG.stat).map(k => `costs.${k}`),
      ...Object.keys(TERIOCK.CONFIG.cost.tweaks).map(k => `tweaks.${k}`),
      ...super._formPaths,
    ];
  }

  /** @inheritDoc */
  get canToggleHeightening() {
    return false;
  }

  /**
   * Stats whose costs this modifies.
   * @returns {Teriock.Keys.Stat[]}
   */
  get stats() {
    return Object.keys(this.costs).filter(k => FormulaField.exists(this.costs[k]));
  }

  /**
   * Modify the formula for the cost of a stat.
   * @param {Teriock.Keys.Stat} stat
   * @param {Teriock.System.FormulaString} base
   * @returns {Teriock.System.FormulaString}
   */
  modifyCost(stat, base) {
    return FormulaField.exists(this.costs[stat]) ? FormulaField.substitute(base, this.costs[stat]) : base;
  }

  /**
   * Modify the value of a tweak.
   * @param {string} tweak
   * @param {number} base
   * @param {object} rollData
   * @returns {number}
   */
  modifyTweak(tweak, base, rollData) {
    if (!FormulaField.exists(this.tweaks[tweak])) { return base; }
    return Math.max(0, BaseRoll.minValue(BaseRoll.replaceFormulaData(this.tweaks[tweak], { base }), rollData));
  }
}
