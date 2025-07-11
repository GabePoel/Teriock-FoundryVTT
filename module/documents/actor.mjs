import TeriockRoll from "./roll.mjs";
import { BaseTeriockActor } from "./_base.mjs";

/**
 * @property {TeriockBaseActorData} system
 * @property {TeriockBaseActorSheet} sheet
 */
export default class TeriockActor extends BaseTeriockActor {
  /**
   * Gets all valid effects that apply to this actor.
   * @inheritdoc
   * @returns {ActiveEffect[]} Array of all applicable effects.
   */
  get validEffects() {
    return Array.from(this.allApplicableEffects());
  }

  /**
   * Gets effects that expire based on conditions.
   * @returns {ActiveEffect[]} Array of condition expiration effects.
   */
  get conditionExpirationEffects() {
    return this.effectTypes.effect?.filter((effect) => effect.system.conditionExpiration) || [];
  }

  /**
   * Gets effects that expire based on movement.
   * @returns {ActiveEffect[]} Array of movement expiration effects.
   */
  get movementExpirationEffects() {
    return this.effectTypes.effect?.filter((effect) => effect.system.movementExpiration) || [];
  }

  /**
   * Gets effects that expire at dawn.
   * @returns {ActiveEffect[]} Array of dawn expiration effects.
   */
  get dawnExpirationEffects() {
    return this.effectTypes.effect?.filter((effect) => effect.system.dawnExpiration) || [];
  }

  /**
   * Gets effects that expire when sustained abilities end.
   * @returns {ActiveEffect[]} Array of sustained expiration effects.
   */
  get sustainedExpirationEffects() {
    return this.effectTypes.effect?.filter((effect) => effect.system.sustainedExpiration) || [];
  }

  /**
   * Checks if the actor is disabled (dead).
   * @returns {boolean} True if the actor is dead, false otherwise.
   */
  get disabled() {
    return this.statuses.has("dead");
  }

  /**
   * Gets roll data for this actor, delegating to the system's getRollData method.
   * @inheritdoc
   * @returns {object} The roll data for this actor.
   */
  getRollData() {
    return this.system.getRollData();
  }

  /**
   * Applies damage to the actor.
   * @param {number} amount - The amount of damage to apply.
   * @returns {Promise<void>} Promise that resolves when damage is applied.
   */
  async takeDamage(amount) {
    await this.system.takeDamage(amount);
  }

  /**
   * Applies drain to the actor.
   * @param {number} amount - The amount of drain to apply.
   * @returns {Promise<void>} Promise that resolves when drain is applied.
   */
  async takeDrain(amount) {
    await this.system.takeDrain(amount);
  }

  /**
   * Applies wither to the actor.
   * @param {number} amount - The amount of wither to apply.
   * @returns {Promise<void>} Promise that resolves when wither is applied.
   */
  async takeWither(amount) {
    await this.system.takeWither(amount);
  }

  /**
   * Applies healing to the actor.
   * @param {number} amount - The amount of healing to apply.
   * @returns {Promise<void>} Promise that resolves when healing is applied.
   */
  async takeHeal(amount) {
    await this.system.takeHeal(amount);
  }

  /**
   * Applies revitalization to the actor.
   * @param {number} amount - The amount of revitalization to apply.
   * @returns {Promise<void>} Promise that resolves when revitalization is applied.
   */
  async takeRevitalize(amount) {
    await this.system.takeRevitalize(amount);
  }

  /**
   * Sets temporary hit points for the actor.
   * @param {number} amount - The amount of temporary hit points to set.
   * @returns {Promise<void>} Promise that resolves when temporary hit points are set.
   */
  async takeSetTempHp(amount) {
    await this.system.takeSetTempHp(amount);
  }

  /**
   * Sets temporary mana points for the actor.
   * @param {number} amount - The amount of temporary mana points to set.
   * @returns {Promise<void>} Promise that resolves when temporary mana points are set.
   */
  async takeSetTempMp(amount) {
    await this.system.takeSetTempMp(amount);
  }

  /**
   * Gains temporary hit points for the actor.
   * @param {number} amount - The amount of temporary hit points to gain.
   * @returns {Promise<void>} Promise that resolves when temporary hit points are gained.
   */
  async takeGainTempHp(amount) {
    await this.system.takeGainTempHp(amount);
  }

  /**
   * Gains temporary mana points for the actor.
   * @param {number} amount - The amount of temporary mana points to gain.
   * @returns {Promise<void>} Promise that resolves when temporary mana points are gained.
   */
  async takeGainTempMp(amount) {
    await this.system.takeGainTempMp(amount);
  }

  /**
   * Applies sleep to the actor.
   * @param {number} amount - The amount of sleep to apply.
   * @returns {Promise<void>} Promise that resolves when sleep is applied.
   */
  async takeSleep(amount) {
    await this.system.takeSleep(amount);
  }

  /**
   * Applies kill effect to the actor.
   * @param {number} amount - The amount of kill effect to apply.
   * @returns {Promise<void>} Promise that resolves when kill effect is applied.
   */
  async takeKill(amount) {
    await this.system.takeKill(amount);
  }

  /**
   * Applies hack effect to a specific part of the actor.
   * @param {HackableBodyPart} part - The part to hack.
   * @returns {Promise<void>} Promise that resolves when hack is applied.
   */
  async takeHack(part) {
    await this.system.takeHack(part);
  }

  /**
   * Removes hack effect from a specific part of the actor.
   * @param {HackableBodyPart} part - The part to unhack.
   * @returns {Promise<void>} Promise that resolves when unhack is applied.
   */
  async takeUnhack(part) {
    await this.system.takeUnhack(part);
  }

  /**
   * Awakens the actor from sleep.
   * @returns {Promise<void>} Promise that resolves when the actor is awakened.
   */
  async takeAwaken() {
    await this.system.takeAwaken();
  }

  /**
   * Revives the actor from death.
   * @returns {Promise<void>} Promise that resolves when the actor is revived.
   */
  async takeRevive() {
    await this.system.takeRevive();
  }

  /**
   * Performs post-update operations for the actor.
   * @param {SkipFunctions} skipFunctions - Functions that should be skipped.
   * @returns {Promise<void>} Resolves when all post-update operations are complete
   * @returns {Promise<void>} Promise that resolves when post-update is complete.
   */
  async postUpdate(skipFunctions = {}) {
    await this.system.postUpdate(skipFunctions);
  }

  /**
   * Rolls a condition check for the actor.
   * @param {string} condition - The condition to roll for.
   * @param {object} options - Options for the roll.
   * @returns {Promise<void>} Promise that resolves when the condition roll is complete.
   */
  async rollCondition(condition, options) {
    await this.system.rollCondition(condition, options);
  }

  /**
   * Rolls a feat save for the specified attribute.
   * @param {string} attribute - The attribute to roll a feat save for.
   * @param {CommonRollOptions} options - Options for the roll.
   * @returns {void}
   */
  rollFeatSave(attribute, options = {}) {
    this.system.rollFeatSave(attribute, options);
  }

  /**
   * Rolls a resistance check.
   * @param {CommonRollOptions} options - Options for the roll.
   * @returns {void}
   */
  rollResistance(options = {}) {
    this.system.rollResistance(options);
  }

  /**
   * Rolls an immunity check.
   * @param {CommonRollOptions} options - Options for the roll.
   * @returns {void}
   */
  rollImmunity(options = {}) {
    this.system.rollImmunity(options);
  }

  /**
   * Rolls a tradecraft check.
   * @param {string} tradecraft - The tradecraft to roll for.
   * @param {CommonRollOptions} options - Options for the roll.
   * @returns {void}
   */
  rollTradecraft(tradecraft, options = {}) {
    this.system.rollTradecraft(tradecraft, options);
  }

  /**
   * Uses an ability by name.
   * @param {string} abilityName - The name of the ability to use.
   * @param {CommonRollOptions} options - Options for using the ability.
   * @returns {void}
   */
  async useAbility(abilityName, options = {}) {
    const abilities = Array.from(this.allApplicableEffects()).filter((i) => i.type === "ability");
    /** @type TeriockAbility */
    const ability = abilities.find((i) => i.name === abilityName);
    if (ability) {
      await ability.use(options);
    } else {
      ui.notifications.warn(`${this.name} does not have ${abilityName}.`);
    }
  }

  /**
   * Ends a condition with an optional roll.
   * @todo Convert to using `ConditionRollOptions` type.
   * @param {CommonRollOptions} options - Options for ending the condition.
   * @returns {void}
   */
  endCondition(options = {}) {
    let message = null;
    if (options.message) {
      message = options.message;
    }
    let rollFormula = "2d4";
    if (options.advantage) {
      rollFormula = "3d4";
    } else if (options.disadvantage) {
      rollFormula = "1d4";
    }
    rollFormula += "kh1";
    const rollData = this.getRollData();
    const roll = new TeriockRoll(rollFormula, rollData, {
      message: message,
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
