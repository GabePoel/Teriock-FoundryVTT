const { TypeDataModel } = foundry.abstract;
import { _migrateData } from "./methods/_migrate-data.mjs";
import { _postUpdate } from "./methods/_post-update.mjs";
import { _getRollData } from "./methods/_roll-data.mjs";
import * as hacks from "./methods/consequences/_take-hacks.mjs";
import * as numericals from "./methods/consequences/_take-numericals.mjs";
import * as oneOffs from "./methods/consequences/_take-one-offs.mjs";
import { _prepareDerivedData } from "./methods/data-deriving/_data-deriving.mjs";
import { _rollCondition } from "./methods/rolling/_roll-condition.mjs";
import * as rollGeneric from "./methods/rolling/_roll-generic.mjs";
import { _defineSchema } from "./methods/schema/_schema.mjs";

/**
 * Base actor data model for the Teriock system.
 * Handles all core actor functionality including damage, healing, rolling, and data management.
 */
export default class TeriockBaseActorData extends TypeDataModel {
  /**
   * Blank metadata.
   *
   * @returns {object} The metadata object.
   */
  static get metadata() {
    return {};
  }

  /**
   * Defines the schema for the base actor data model.
   *
   * @returns {object} The schema definition for the actor data.
   * @override
   */
  static defineSchema() {
    return _defineSchema();
  }

  /**
   * Migrates actor data to the current schema version.
   *
   * @param {object} data - The data to migrate.
   * @returns {object} The migrated data.
   * @override
   */
  static migrateData(data) {
    data = _migrateData(data);
    return super.migrateData(data);
  }

  /**
   * Prepares derived data for the actor, calculating stats, speeds, and other derived values.
   *
   * @override
   */
  prepareDerivedData() {
    _prepareDerivedData(this);
  }

  /**
   * Applies damage to the actor's hit points.
   *
   * Relevant wiki pages:
   * - [Damage](https://wiki.teriock.com/index.php/Core:Damage)
   *
   * @param {number} amount - The amount of damage to apply.
   * @returns {Promise<void>} Promise that resolves when damage is applied.
   */
  async takeDamage(amount) {
    await numericals._takeDamage(this, amount);
  }

  /**
   * Applies drain to the actor's mana points.
   *
   * Relevant wiki pages:
   * - [Mana Drain](https://wiki.teriock.com/index.php/Drain:Mana)
   *
   * @param {number} amount - The amount of drain to apply.
   * @returns {Promise<void>} Promise that resolves when drain is applied.
   */
  async takeDrain(amount) {
    await numericals._takeDrain(this, amount);
  }

  /**
   * Applies wither to the actor's hit points.
   *
   * Relevant wiki pages:
   * - [Wither](https://wiki.teriock.com/index.php/Drain:Wither)
   *
   * @param {number} amount - The amount of wither to apply.
   * @returns {Promise<void>} Promise that resolves when wither is applied.
   */
  async takeWither(amount) {
    await numericals._takeWither(this, amount);
  }

  /**
   * Applies healing to the actor's hit points.
   *
   * Relevant wiki pages:
   * - [Healing](https://wiki.teriock.com/index.php/Core:Healing)
   *
   * @param {number} amount - The amount of healing to apply.
   * @returns {Promise<void>} Promise that resolves when healing is applied.
   */
  async takeHeal(amount) {
    await numericals._takeHeal(this, amount);
  }

  /**
   * Applies revitalization to the actor's mana points.
   *
   * Relevant wiki pages:
   * - [Revitalizing](https://wiki.teriock.com/index.php/Core:Revitalizing)
   *
   * @param {number} amount - The amount of revitalization to apply.
   * @returns {Promise<void>} Promise that resolves when revitalization is applied.
   */
  async takeRevitalize(amount) {
    await numericals._takeRevitalize(this, amount);
  }

  /**
   * Sets the actor's temporary hit points to a specific amount.
   *
   * Relevant wiki pages:
   * - [Temporary Hit Points](https://wiki.teriock.com/index.php/Core:Temporary_Hit_Points)
   *
   * @param {number} amount - The amount to set temporary hit points to.
   * @returns {Promise<void>} Promise that resolves when temporary hit points are set.
   */
  async takeSetTempHp(amount) {
    await numericals._takeSetTempHp(this, amount);
  }

  /**
   * Sets the actor's temporary mana points to a specific amount.
   *
   * Relevant wiki pages:
   * - [Temporary Mana Points](https://wiki.teriock.com/index.php/Core:Temporary_Mana_Points)
   *
   * @param {number} amount - The amount to set temporary mana points to.
   * @returns {Promise<void>} Promise that resolves when temporary mana points are set.
   */
  async takeSetTempMp(amount) {
    await numericals._takeSetTempMp(this, amount);
  }

  /**
   * Gains temporary hit points for the actor.
   *
   * Relevant wiki pages:
   * - [Temporary Hit Points](https://wiki.teriock.com/index.php/Core:Temporary_Hit_Points)
   *
   * @param {number} amount - The amount of temporary hit points to gain.
   * @returns {Promise<void>} Promise that resolves when temporary hit points are gained.
   */
  async takeGainTempHp(amount) {
    await numericals._takeGainTempHp(this, amount);
  }

  /**
   * Gains temporary mana points for the actor.
   *
   * Relevant wiki pages:
   * - [Temporary Mana Points](https://wiki.teriock.com/index.php/Core:Temporary_Mana_Points)
   *
   * @param {number} amount - The amount of temporary mana points to gain.
   * @returns {Promise<void>} Promise that resolves when temporary mana points are gained.
   */
  async takeGainTempMp(amount) {
    await numericals._takeGainTempMp(this, amount);
  }

  /**
   * Applies sleep to the actor.
   *
   * Relevant wiki pages:
   * - [Swift Sleep Aura](https://wiki.teriock.com/index.php/Ability:Swift_Sleep_Aura)
   *
   * @param {number} amount - The amount of sleep to apply.
   * @returns {Promise<void>} Promise that resolves when sleep is applied.
   */
  async takeSleep(amount) {
    await numericals._takeSleep(this, amount);
  }

  /**
   * Applies kill effect to the actor.
   *
   * Relevant wiki pages:
   * - [Death Ray](https://wiki.teriock.com/index.php/Ability:Death_Ray)
   *
   * @param {number} amount - The amount of kill effect to apply.
   * @returns {Promise<void>} Promise that resolves when kill effect is applied.
   */
  async takeKill(amount) {
    await numericals._takeKill(this, amount);
  }

  /**
   * Applies hack effect to a specific part of the actor.
   *
   * Relevant wiki pages:
   * - [Hack](https://wiki.teriock.com/index.php/Damage:Hack)
   *
   * @param {Teriock.HackableBodyPart} part - The part to hack.
   * @returns {Promise<void>} Promise that resolves when hack is applied.
   */
  async takeHack(part) {
    await hacks._takeHack(this, part);
  }

  /**
   * Removes hack effect from a specific part of the actor.
   *
   * Relevant wiki pages:
   * - [Hack](https://wiki.teriock.com/index.php/Damage:Hack)
   *
   * @param {Teriock.HackableBodyPart} part - The part to unhack.
   * @returns {Promise<void>} Promise that resolves when unhack is applied.
   */
  async takeUnhack(part) {
    await hacks._takeUnhack(this, part);
  }

  /**
   * Awakens the actor from sleep.
   *
   * Relevant wiki pages:
   * - [Awaken](https://wiki.teriock.com/index.php/Keyword:Awaken)
   *
   * @returns {Promise<void>} Promise that resolves when the actor is awakened.
   */
  async takeAwaken() {
    await oneOffs._takeAwaken(this);
  }

  /**
   * Revives the actor from death.
   *
   * Relevant wiki pages:
   * - [Revival Effects](https://wiki.teriock.com/index.php/Category:Revival_effects)
   *
   * @returns {Promise<void>} Promise that resolves when the actor is revived.
   */
  async takeRevive() {
    await oneOffs._takeRevive(this);
  }

  /**
   * Rolls a condition check for the actor.
   *
   * Relevant wiki pages:
   * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
   *
   * @param {string} condition - The condition to roll for.
   * @param {Teriock.ConditionRollOptions} options - Options for the condition roll.
   * @returns {Promise<void>} Promise that resolves when the condition roll is complete.
   */
  async rollCondition(condition, options) {
    await _rollCondition(this, condition, options);
  }

  /**
   * Performs post-update operations for the actor.
   *
   * @param {Teriock.SkipFunctions} skipFunctions - Functions that should be skipped.
   * @returns {Promise<void>} Resolves when all post-update operations are complete
   */
  async postUpdate(skipFunctions) {
    await _postUpdate(this, skipFunctions);
  }

  /**
   * Rolls a feat save for the specified attribute.
   *
   * Relevant wiki pages:
   * - [Feat Interaction](https://wiki.teriock.com/index.php/Core:Feat_Interaction)
   *
   * @param {string} attribute - The attribute to roll a feat save for.
   * @param {Teriock.CommonRollOptions} options - Options for the roll.
   * @returns {Promise<void>}
   */
  async rollFeatSave(attribute, options = {}) {
    await rollGeneric._rollFeatSave(this, attribute, options);
  }

  /**
   * Rolls a resistance check.
   *
   * Relevant wiki pages:
   * - [Resistance](https://wiki.teriock.com/index.php/Ability:Resist_Effects)
   *
   * @param {Teriock.CommonRollOptions} options - Options for the roll.
   * @returns {Promise<void>}
   */
  async rollResistance(options = {}) {
    await rollGeneric._rollResistance(this, options);
  }

  /**
   * Rolls an immunity check.
   *
   * Relevant wiki pages:
   * - [Immunity](https://wiki.teriock.com/index.php/Keyword:Immunity)
   *
   * @param {Teriock.CommonRollOptions} options - Options for the roll.
   * @returns {Promise<void>}
   */
  async rollImmunity(options = {}) {
    await rollGeneric._rollImmunity(this, options);
  }

  /**
   * Rolls a tradecraft check.
   *
   * Relevant wiki pages:
   * - [Tradecrafts](https://wiki.teriock.com/index.php/Core:Tradecrafts)
   *
   * @param {string} tradecraft - The tradecraft to roll for.
   * @param {Teriock.CommonRollOptions} options - Options for the roll.
   * @returns {Promise<void>}
   */
  async rollTradecraft(tradecraft, options = {}) {
    await rollGeneric._rollTradecraft(this, tradecraft, options);
  }

  /**
   * Gets roll data for this actor, including all relevant stats and modifiers.
   *
   * @returns {object} The roll data object containing actor stats and modifiers.
   */
  getRollData() {
    return _getRollData(this);
  }
}
