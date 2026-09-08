import { mixClasses } from "../../../../helpers/construction.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { TakeActivation } from "../../activations/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import { TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes TriggerAutomation
 */
export default class TakeAutomation extends mixClasses(BaseAutomation, TriggerAutomationMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Take"];

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "take" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      amount: new fields.NumberField({ nullable: true, placeholder: _loc("COMMON.Default") }),
      impact: new fields.StringField({
        choices: objectMap(TERIOCK.config.impact, i => i.take, { localize: true, filter: c => !c?.hidden }),
        initial: "damage",
        nullable: false,
        required: true,
      }),
      morganti: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["impact", "amount"];
    if (TERIOCK.config.impact[this.impact]?.morganti) { paths.push("morganti"); }
    paths.push("hr", ...this._triggerDisplayPaths);
    return paths;
  }

  /** @inheritDoc */
  async _getActivations() {
    if (this.impact && this.impact !== "other") {
      return [new TakeActivation({ amount: this.amount, impact: this.impact, morganti: this.morganti })];
    }
    return [];
  }
}
