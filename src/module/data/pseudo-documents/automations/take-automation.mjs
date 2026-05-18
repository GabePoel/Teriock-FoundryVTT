import { mixClasses } from "../../../helpers/construction.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import { migrateKey } from "../../shared/migrations/source-migrations.mjs";
import { TakeActivation } from "../activations/_module.mjs";
import { CritAutomation } from "./abstract/_module.mjs";
import * as mixins from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Keys.Impact} impact
 * @property {boolean} morganti
 * @property {boolean} showDialog
 * @property {number | null} amount
 * @extends {CritAutomation}
 * @mixes DisplayAutomation
 * @mixes TriggerAutomation
 */
export default class TakeAutomation extends mixClasses(
  CritAutomation,
  mixins.DisplayAutomationMixin,
  mixins.TriggerAutomationMixin,
) {
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
          localize: true,
          filter: c => !c?.hidden,
        }),
        initial: "damage",
        nullable: false,
        required: true,
      }),
      morganti: new fields.BooleanField(),
      showDialog: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateKey(source, "take", "impact");
    return super.migrateData(source, options, state);
  }

  /** @inheritDoc */
  get _displayPaths() {
    return ["hr", ...super._displayPaths, "showDialog"];
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["impact", "amount"];
    if (TERIOCK.config.impact[this.impact]?.morganti) {
      paths.push("morganti");
    }
    paths.push(...[...this._triggerPaths, ...this._triggerDisplayPaths]);
    return paths;
  }

  /** @inheritDoc */
  async _getActivations() {
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

  /** @inheritDoc */
  _onFire(scope) {
    this._activateActivations(scope);
  }

  /** @inheritDoc */
  prepareData() {
    if (this.isRepeatable) {
      this.showDialog = true;
    }
  }
}
