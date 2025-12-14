import { boostDialog } from "../../../../applications/dialogs/_module.mjs";
import { TeriockRoll } from "../../../../dice/_module.mjs";
import { makeIconClass, pureUuid } from "../../../utils.mjs";
import ActionHandler from "../action-handler.mjs";

/**
 * Action to use an ability.
 */
export class StandardDamageHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "standard-damage";

  /**
   * @inheritDoc
   * @param {UUID<TeriockArmament>} [attacker]
   */
  static buildButton(attacker) {
    const button = super.buildButton();
    button.icon = makeIconClass("hammer-crash", "button");
    button.label = "Standard Damage";
    if (attacker) {
      button.dataset.attacker = attacker;
    }
    return button;
  }

  /**
   * @param {TeriockActor} actor
   * @param {string} formula - Roll formula
   * @param {Teriock.RollOptions.EquipmentRoll} options
   * @private
   */
  async _makeRoll(actor, formula, options = { crit: false }) {
    let attacker = actor.system.primaryAttacker;
    if (this.dataset.attacker) {
      attacker = await fromUuid(pureUuid(this.dataset.attacker));
    }
    options.secret = true;
    options.formula = formula;
    const roll = new TeriockRoll(formula);
    if (options.crit) {
      roll.alter(2, 0, { multiplyNumeric: false });
      options.formula = roll.formula;
    }
    await roll.evaluate();
    await attacker.use(options);
  }

  /**
   * @param {TeriockActor} actor
   * @returns {string}
   * @private
   */
  async _prepFormula(actor) {
    let attacker = actor.system.primaryAttacker;
    if (this.dataset.attacker) {
      attacker = await fromUuid(pureUuid(this.dataset.attacker));
    }
    let formula = attacker.system.damage.base.formula;
    if (this.event.ctrlKey) {
      formula = attacker.system.damage.twoHanded.formula;
    }
    return formula;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.selectedActors) {
      if (!(actor.system.primaryAttacker || this.dataset.attacker)) {
        ui.notifications.error(
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
        ui.notifications.error(
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
