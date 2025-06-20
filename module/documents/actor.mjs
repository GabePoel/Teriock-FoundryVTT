// Allows for typing within mixin.
/** @import Actor from "@client/documents/actor.mjs"; */
/** @import { CommonRollOptions } from "../types/rolls" */
const { Actor } = foundry.documents;
import { MixinParentDocument } from "./mixins/parent-mixin.mjs";
import TeriockRoll from "./roll.mjs";

/**
 * @extends {Actor}
 */
export default class TeriockActor extends MixinParentDocument(Actor) {
  /** @inheritdoc */
  getRollData() {
    return this.system.getRollData();
  }

  /** @inheritdoc */
  get validEffects() {
    return Array.from(this.allApplicableEffects());
  }

  /**
   * @returns {ActiveEffect[]}
   */
  get conditionExpirationEffects() {
    return this.effectTypes.effect.filter((effect) => effect.system.conditionExpiration);
  }

  /**
   * @returns {ActiveEffect[]}
   */
  get movementExpirationEffects() {
    return this.effectTypes.effect.filter((effect) => effect.system.movementExpiration);
  }

  /**
   * @returns {ActiveEffect[]}
   */
  get dawnExpirationEffects() {
    return this.effectTypes.effect.filter((effect) => effect.system.dawnExpiration);
  }

  /**
   * @returns {ActiveEffect[]}
   */
  get sustainedExpirationEffects() {
    return this.effectTypes.effect.filter((effect) => effect.system.sustainedExpiration);
  }

  /**
   * @returns {boolean}
   */
  get disabled() {
    return this.statuses.has("dead");
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeDamage(amount) {
    await this.system.takeDamage(amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeDrain(amount) {
    await this.system.takeDrain(amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeWither(amount) {
    await this.system.takeWither(amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeHeal(amount) {
    await this.system.takeHeal(amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeRevitalize(amount) {
    await this.system.takeRevitalize(amount);
  }

  /**
   * @param {string} part
   * @returns {Promise<void>}
   */
  async takeHack(part) {
    await this.system.takeHack(part);
  }

  /**
   * @param {string} part
   * @returns {Promise<void>}
   */
  async takeUnhack(part) {
    await this.system.takeUnhack(part);
  }

  /**
   * @returns {Promise<void>}
   */
  async postUpdate() {
    await this.system.postUpdate();
  }

  /**
   * @param {string} condition
   * @param {object} options
   * @returns {Promise<void>}
   */
  async rollCondition(condition, options) {
    await this.system.rollCondition(condition, options);
  }

  /**
   * @param {string} attribute
   * @param {CommonRollOptions} options
   * @returns {void}
   */
  rollFeatSave(attribute, options = {}) {
    this.system.rollFeatSave(attribute, options);
  }

  /**
   * @param {CommonRollOptions} options
   * @returns {void}
   */
  rollResistance(options = {}) {
    this.system.rollResistance(options);
  }

  /**
   * @param {CommonRollOptions} options
   * @returns {void}
   */
  rollTradecraft(tradecraft, options = {}) {
    this.system.rollTradecraft(tradecraft, options);
  }

  /**
   * @param {string} abilityName
   * @param {CommonRollOptions} options
   * @returns {void}
   */
  useAbility(abilityName, options = {}) {
    const abilities = Array.from(this.allApplicableEffects()).filter((i) => i.type === "ability");
    const ability = abilities.find((i) => i.name === abilityName);
    if (ability) {
      ability.use(options);
    } else {
      ui.notifications.warn(`${this.name} does not have ${abilityName}.`);
    }
    return;
  }

  /**
   * @todo Convert to using `ConditionRollOptions` type.
   * @param {CommonRollOptions} options
   * @returns {void}
   */
  endCondition(options = {}) {
    let rollFormula = "2d4";
    if (options.advantage) {
      rollFormula = "3d4";
    } else if (options.disadvantage) {
      rollFormula = "1d4";
    }
    rollFormula += "kh1";
    const rollData = this.getRollData();
    const roll = new TeriockRoll(rollFormula, rollData, {
      context: {
        diceClass: "condition",
        threshold: 4,
      },
    });
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: "Condition Ending Roll",
    });
  }
}
