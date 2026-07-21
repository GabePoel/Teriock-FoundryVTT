import { icons } from "../../../constants/display/icons.mjs";
import { omit } from "../../../helpers/utils.mjs";
import AttackAutomation from "../automations/attack-automation.mjs";
import { AutomationActivationFactory } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * An activation that makes an attack roll with no ability associated with it.
 * @extends {BaseActivation}
 * @property {CompetenceModel} competence
 * @property {ID<TeriockArmament>|null} armamentId
 * @property {Teriock.System.FormulaString} attackPenalty
 * @property {Teriock.System.FormulaString} bonus
 * @property {boolean|null} limb
 * @property {boolean|null} sb
 * @property {boolean|null} vitals
 * @property {boolean|null} warded
 * @property {boolean} useArmament
 * @property {number|null} threshold
 * @see {AttackAutomation}
 * @see {AttackRollExecution}
 */
export default class AttackActivation extends AutomationActivationFactory(AttackAutomation) {
  /** @inheritDoc */
  static get ICON() {
    return icons.interaction.attack;
  }

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.ROLLS.Attack.button";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(omit(super.defineSchema(), ["keepArmament", "overrideCompetence"]), {
      armamentId: new fields.DocumentIdField(),
      threshold: new fields.NumberField({ initial: null, integer: true, nullable: true }),
    });
  }

  /**
   * Options passed to each attack this makes.
   * @returns {Partial<Teriock.Execution.AttackExecutionOptions>}
   */
  get #options() {
    /** @type {Partial<Teriock.Execution.AttackExecutionOptions>} */
    const options = {
      attackPenalty: this.attackPenalty ? this.attackPenalty : undefined,
      bonus: this.bonus,
      competence: this.competence.value,
      event: this.event,
      threshold: typeof this.threshold === "number" ? this.threshold : undefined,
      useArmament: this.useArmament,
    };
    for (const key of ["limb", "sb", "vitals", "warded"]) {
      if (this[key] !== null) { options[key] = this[key]; }
    }
    return options;
  }

  /**
   * Make an attack for each connected actor.
   * @returns {Promise<void>}
   */
  async #act() {
    if (!this.checkActors()) { return; }
    for (const actor of this.actors) {
      await actor.system.rollAttack({ ...this.#options, armament: actor.items.get(this.armamentId) });
    }
  }

  /** @inheritDoc */
  async primaryAction() {
    await this.#act();
  }

  /** @inheritDoc */
  async secondaryAction() {
    await this.#act();
  }
}
