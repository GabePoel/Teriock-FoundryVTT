import { objectMap } from "../../../helpers/utils.mjs";
import { migrateKey } from "../../shared/migrations/source-migrations.mjs";
import { TakeActivation } from "../activations/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import { DisplayAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Keys.Impact} impact
 * @property {boolean} morganti
 * @property {boolean} showDialog
 * @property {number | null} amount
 * @mixes DisplayAutomation
 * @extends {BaseAutomation}
 */
export default class TakeAutomation extends DisplayAutomationMixin(BaseAutomation) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Take"];

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
      amount: new fields.NumberField({ nullable: true }),
      impact: new fields.StringField({
        choices: objectMap(TERIOCK.config.impact, i => i.take, {
          filter: c => !c?.hidden,
          localize: true,
        }),
        initial: "damage",
        nullable: false,
        required: true,
      }),
      morganti: new fields.BooleanField({ initial: false }),
      showDialog: new fields.BooleanField({ initial: false }),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateKey(source, "take", "impact");
    return super.migrateData(source, options, state);
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["impact", "amount"];
    if (TERIOCK.config.impact[this.impact]?.morganti) {
      paths.push("morganti");
    }
    paths.push(...["hr", "display.label", "showDialog"]);
    return paths;
  }

  /** @inheritDoc */
  async getActivations() {
    if (this.impact && this.impact !== "other") {
      return [
        new TakeActivation({
          amount: this.amount,
          display: this.display,
          impact: this.impact,
          morganti: this.morganti,
          showDialog: this.showDialog,
        }),
      ];
    }
    return [];
  }
}
