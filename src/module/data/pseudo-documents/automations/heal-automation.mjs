import { HealActivation } from "../activations/command-activations.mjs";
import { StatAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {boolean} noStatDice
 */
export default class HealAutomation extends StatAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Heal"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.EFFECTS.Common.heal";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "heal";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { noStatDice: new fields.BooleanField({ initial: false }) });
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = this.noStatDice ? this._triggerPaths : super._formPaths;
    return ["noStatDice", ...paths];
  }

  /** @inheritDoc */
  async _getActivations() {
    return [
      new HealActivation({
        options: {
          bonus: this.bonus,
          consumeStatDice: this.consumeStatDice,
          forHarm: this.forHarm,
          noStatDice: this.noStatDice,
        },
      }),
    ];
  }

  /** @inheritDoc */
  canFire(trigger) {
    return (this.actor?.system.isDamaged || this.forHarm) && super.canFire(trigger);
  }
}
