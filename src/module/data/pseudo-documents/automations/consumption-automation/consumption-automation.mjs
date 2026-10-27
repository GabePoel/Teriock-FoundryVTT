import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { mergeMetadata, objectMap } from "../../../../utils/_module.mjs";
import { qualifierField } from "../../../fields/tools/builders.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

export default class ConsumptionAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Consumption"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { consumable: true }, type: "consumption" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      qualifier: qualifierField({ initial: "1" }),
      stats: new fields.SetField(
        new fields.StringField({ choices: objectMap(TERIOCK.CONFIG.stat, v => v.label, { localize: true }) }),
      ),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["stats", "qualifier"];
  }

  /** @inheritDoc */
  get formTips() {
    const tips = super.formTips;
    if (!this.getNearestDocument()?.system?.consumption?.enabled) {
      tips.unshift({ level: "error", text: "TERIOCK.AUTOMATIONS.Consumption.NOTIFICATIONS.parentNotConsumable" });
    }
    return tips;
  }

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}, config = {}) {
    if (path === "qualifier") { inputConfig.context = "ability"; }
    return super._makeFormGroup(path, groupConfig, inputConfig, config);
  }

  /**
   * Whether this can pay a stat cost for an ability.
   * @param {TeriockActiveEffect<"ability">} ability
   * @param {Teriock.Keys.Stat} stat
   * @returns {boolean}
   */
  canPay(ability, stat) {
    const document = this.getNearestDocument();
    return this.stats.has(stat) && document !== ability && document?.system.consumption?.enabled
      && BaseRoll.qualify(this.qualifier, () => ability.system.getLocalRollData());
  }
}
