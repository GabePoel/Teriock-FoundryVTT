import { objectMap } from "../../../helpers/utils.mjs";
import { TakeActivation } from "../activations/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import { DisplayAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Keys.Impact} impact
 * @property {number | null} amount
 * @mixes DisplayAutomation
 * @extends {BaseAutomation}
 */
export default class TakeAutomation extends DisplayAutomationMixin(
  BaseAutomation,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.Take",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Take.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "take";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      impact: new fields.StringField({
        choices: objectMap(TERIOCK.options.impact, (i) => i.take, {
          filter: (c) => !c?.hidden,
          localize: true,
        }),
      }),
      amount: new fields.NumberField({ nullable: true }),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    if (data.take) data.impact = data.take;
    return super.migrateData(data);
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["impact", "amount", "display.label"];
  }

  /** @inheritDoc */
  async getActivations() {
    if (this.amount && this.impact && this.impact !== "other") {
      return [
        new TakeActivation({
          impact: this.impact,
          amount: this.amount,
          display: this.display,
        }),
      ];
    }
    return [];
  }
}
