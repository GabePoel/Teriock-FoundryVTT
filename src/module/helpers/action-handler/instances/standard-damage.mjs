import boostDialog from "../../../applications/dialogs/boost-dialog.mjs";
import TeriockRoll from "../../../documents/roll.mjs";
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
    options.secret = true;
    options.formula = formula;
    const roll = new TeriockRoll(formula);
    if (options.crit) {
      roll.alter(2, 0, { multiplyNumeric: false });
      options.formula = roll.formula;
    }
    await roll.evaluate();
    await actor.system.wielding.attacker.derived.roll(options);
  }

  /**
   * @param {TeriockActor} actor
   * @returns {string}
   * @private
   */
  _prepFormula(actor) {
    let formula = actor.system.wielding.attacker.derived.system.derivedDamage;
    if (this.event.ctrlKey) {
      formula =
        actor.system.wielding.attacker.derived.system.derivedTwoHandedDamage;
    }
    return formula;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.selectedActors) {
      if (!actor.system.wielding.attacker.derived) {
        ui.notifications.error(
          `${actor.name} doesn't have a default attack weapon.`,
        );
        continue;
      }
      await this._makeRoll(actor, this._prepFormula(actor), {
        twoHanded: this.event.ctrlKey,
        crit: this.event.altKey,
      });
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.selectedActors) {
      if (!actor.system.wielding.attacker.derived) {
        ui.notifications.error(
          `${actor.name} doesn't have a default attack weapon.`,
        );
        continue;
      }
      const formula = await boostDialog(this._prepFormula(actor), {
        crit: this.event.altKey,
      });
      await this._makeRoll(actor, formula, { crit: false });
    }
  }
}
