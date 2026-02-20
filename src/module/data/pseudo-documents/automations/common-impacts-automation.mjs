import {
  AwakenHandler,
  DeathBagHandler,
  HealHandler,
  ReviveHandler,
  StandardDamageHandler,
} from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import BaseAutomation from "./base-automation.mjs";

const { fields } = foundry.data;

/**
 * @property {Set<Teriock.Parameters.Consequence.CommonImpactKey>} common
 */
export default class CommonImpactsAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.CommonImpactsAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.CommonImpactsAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "common";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      common: new fields.SetField(
        new fields.StringField({
          choices: TERIOCK.options.consequence.common,
        }),
      ),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["common"];
  }

  /** @inheritDoc */
  get buttons() {
    const buttons = [];
    if (this.common.has("standardDamage")) {
      buttons.push(StandardDamageHandler.buildButton());
    }
    if (this.common.has("awaken")) {
      buttons.push(AwakenHandler.buildButton());
    }
    if (this.common.has("revive")) {
      buttons.push(ReviveHandler.buildButton());
    }
    if (this.common.has("bag")) {
      buttons.push(DeathBagHandler.buildButton());
    }
    if (this.common.has("heal")) {
      buttons.push(HealHandler.buildButton());
    }
    if (this.common.has("revitalize")) {
      buttons.push(ReviveHandler.buildButton());
    }
    return buttons;
  }
}
