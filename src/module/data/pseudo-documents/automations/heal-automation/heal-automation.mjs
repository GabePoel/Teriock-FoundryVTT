import { mergeMetadata } from "../../../../utils/_module.mjs";
import commandActivations from "../../activations/command-activations.mjs";
import { StatAutomation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {boolean} noStatDice
 */
export default class HealAutomation extends StatAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Heal"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "heal" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { noStatDice: new fields.BooleanField({ initial: false }) });
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = this.noStatDice ? this._triggerDisplayPaths : super._formPaths;
    return ["noStatDice", ...paths];
  }

  /** @inheritDoc */
  async _getActivations() {
    return [
      new commandActivations.heal({
        options: {
          consumeStatDice: this.consumeStatDice,
          forHarm: this.forHarm,
          noStatDice: this.noStatDice,
          substitution: this.substitution,
        },
      }),
    ];
  }

  /** @inheritDoc */
  validateTrigger(trigger, scope) {
    return (this.actor?.system.isDamaged || this.forHarm) && super.validateTrigger(trigger, scope);
  }
}
