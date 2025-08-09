import TeriockRoll from "../../../documents/roll.mjs";
import boostDialog from "../../../applications/dialogs/boost-dialog.mjs";
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
  async _makeRoll(actor, formula, options = {}) {
    const roll = new TeriockRoll(formula);
    if (this.critRollOptions.crit) {
      roll.alter(2, 0, { multiplyNumeric: false });
    }
    await roll.evaluate();
    options.secret = true;
    options.formula = formula;
    await actor.system.wielding.attacker.derived?.roll(options);
  }

  /**
   * @param {TeriockActor} actor
   * @returns {string}
   * @private
   */
  _prepFormula(actor) {
    let formula = actor.system.wielding.attacker.derived?.system.damage;
    if (this.event.ctrlKey) {
      formula = actor.system.wielding.attacker.derived?.system.twoHandedDamage;
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
      });
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.selectedActors) {
      const formula = await boostDialog(this._prepFormula(actor));
      await this._makeRoll(actor, formula);
    }
  }
}
