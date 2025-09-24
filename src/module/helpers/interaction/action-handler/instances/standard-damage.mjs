import { boostDialog } from "../../../../applications/dialogs/_module.mjs";
import { TeriockRoll } from "../../../../dice/_module.mjs";
import { pureUuid } from "../../../utils.mjs";
import ActionHandler from "../action-handler.mjs";

/**
 * Action to use an ability.
 */
export class StandardDamageHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "standard-damage";

  /**
   * @param {TeriockActor} actor
   * @param {string} formula - Roll formula
   * @param {Teriock.RollOptions.EquipmentRoll} options
   * @private
   */
  async _makeRoll(actor, formula, options = { crit: false }) {
    let attacker = actor.system.primaryAttacker;
    if (this.dataset.attacker) {
      attacker = await foundry.utils.fromUuid(pureUuid(this.dataset.attacker));
    }
    options.secret = true;
    options.formula = formula;
    const roll = new TeriockRoll(formula);
    if (options.crit) {
      roll.alter(2, 0, { multiplyNumeric: false });
      options.formula = roll.formula;
    }
    await roll.evaluate();
    await attacker.roll(options);
  }

  /**
   * @param {TeriockActor} actor
   * @returns {string}
   * @private
   */
  async _prepFormula(actor) {
    let attacker = actor.system.primaryAttacker;
    if (this.dataset.attacker) {
      attacker = await foundry.utils.fromUuid(pureUuid(this.dataset.attacker));
    }
    let formula = attacker.system.damage.base.value;
    if (this.event.ctrlKey) {
      formula = attacker.system.damage.twoHanded.value;
    }
    return formula;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.selectedActors) {
      if (!(actor.system.primaryAttacker || this.dataset.attacker)) {
        foundry.ui.notifications.error(
          `${actor.name} doesn't have a default attack weapon.`,
        );
        continue;
      }
      const [formula] = await Promise.all([this._prepFormula(actor)]);
      await this._makeRoll(actor, formula, {
        twoHanded: this.event.ctrlKey,
        crit: this.event.altKey,
      });
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.selectedActors) {
      if (!(actor.system.primaryAttacker || this.dataset.attacker)) {
        foundry.ui.notifications.error(
          `${actor.name} doesn't have a default attack weapon.`,
        );
        continue;
      }
      let [formula] = await Promise.all([this._prepFormula(actor)]);
      formula = await boostDialog(formula, {
        crit: this.event.altKey,
      });
      await this._makeRoll(actor, formula, { crit: false });
    }
  }
}
