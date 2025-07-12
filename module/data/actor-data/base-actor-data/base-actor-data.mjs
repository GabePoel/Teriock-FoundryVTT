const { TypeDataModel } = foundry.abstract;
import * as hacks from "./methods/consequences/_take-hacks.mjs";
import * as numericals from "./methods/consequences/_take-numericals.mjs";
import * as oneOffs from "./methods/consequences/_take-one-offs.mjs";
import * as rollGeneric from "./methods/rolling/_roll-generic.mjs";
import { _defineSchema } from "./methods/schema/_schema.mjs";
import { _getRollData } from "./methods/_roll-data.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";
import { _postUpdate } from "./methods/_post-update.mjs";
import { _prepareDerivedData } from "./methods/data-deriving/_data-deriving.mjs";
import { _rollCondition } from "./methods/rolling/_roll-condition.mjs";

/**
 * Base actor data model for the Teriock system.
 * Handles all core actor functionality including damage, healing, rolling, and data management.
 */
export default class TeriockBaseActorData extends TypeDataModel {
  /**
   * Blank metadata.
   * @returns {object} The metadata object.
   */
  static get metadata() {
    return {};
  }

  /**
   * Defines the schema for the base actor data model.
   * @returns {object} The schema definition for the actor data.
   * @override
   */
  static defineSchema() {
    return _defineSchema();
  }

  /**
   * Migrates actor data to the current schema version.
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
   * @override
   */
  prepareDerivedData() {
    _prepareDerivedData(this);
  }

  /**
   * Applies damage to the actor's hit points.
   * @param {number} amount - The amount of damage to apply.
   * @returns {Promise<void>} Promise that resolves when damage is applied.
   */
  async takeDamage(amount) {
    await numericals._takeDamage(this, amount);
  }

  /**
   * Applies drain to the actor's mana points.
   * @param {number} amount - The amount of drain to apply.
   * @returns {Promise<void>} Promise that resolves when drain is applied.
   */
  async takeDrain(amount) {
    await numericals._takeDrain(this, amount);
  }

  /**
   * Applies wither to the actor's hit points.
   * @param {number} amount - The amount of wither to apply.
   * @returns {Promise<void>} Promise that resolves when wither is applied.
   */
  async takeWither(amount) {
    await numericals._takeWither(this, amount);
  }

  /**
   * Applies healing to the actor's hit points.
   * @param {number} amount - The amount of healing to apply.
   * @returns {Promise<void>} Promise that resolves when healing is applied.
   */
  async takeHeal(amount) {
    await numericals._takeHeal(this, amount);
  }

  /**
   * Applies revitalization to the actor's mana points.
   * @param {number} amount - The amount of revitalization to apply.
   * @returns {Promise<void>} Promise that resolves when revitalization is applied.
   */
  async takeRevitalize(amount) {
    await numericals._takeRevitalize(this, amount);
  }

  /**
   * Sets the actor's temporary hit points to a specific amount.
   * @param {number} amount - The amount to set temporary hit points to.
   * @returns {Promise<void>} Promise that resolves when temporary hit points are set.
   */
  async takeSetTempHp(amount) {
    await numericals._takeSetTempHp(this, amount);
  }

  /**
   * Sets the actor's temporary mana points to a specific amount.
   * @param {number} amount - The amount to set temporary mana points to.
   * @returns {Promise<void>} Promise that resolves when temporary mana points are set.
   */
  async takeSetTempMp(amount) {
    await numericals._takeSetTempMp(this, amount);
  }

  /**
   * Gains temporary hit points for the actor.
   * @param {number} amount - The amount of temporary hit points to gain.
   * @returns {Promise<void>} Promise that resolves when temporary hit points are gained.
   */
  async takeGainTempHp(amount) {
    await numericals._takeGainTempHp(this, amount);
  }

  async takeGainTempMp(amount) {
    await numericals._takeGainTempMp(this, amount);
  }

  /**
   * Applies sleep to the actor.
   * @param {number} amount - The amount of sleep to apply.
   * @returns {Promise<void>} Promise that resolves when sleep is applied.
   */
  async takeSleep(amount) {
    await numericals._takeSleep(this, amount);
  }

  /**
   * Applies kill effect to the actor.
   * @param {number} amount - The amount of kill effect to apply.
   * @returns {Promise<void>} Promise that resolves when kill effect is applied.
   */
  async takeKill(amount) {
    await numericals._takeKill(this, amount);
  }

  /**
   * Applies hack effect to a specific part of the actor.
   * @param {Teriock.HackableBodyPart} part - The part to hack.
   * @returns {Promise<void>} Promise that resolves when hack is applied.
   */
  async takeHack(part) {
    await hacks._takeHack(this, part);
  }

  /**
   * Removes hack effect from a specific part of the actor.
   * @param {Teriock.HackableBodyPart} part - The part to unhack.
   * @returns {Promise<void>} Promise that resolves when unhack is applied.
   */
  async takeUnhack(part) {
    await hacks._takeUnhack(this, part);
  }

  /**
   * Awakens the actor from sleep.
   * @returns {Promise<void>} Promise that resolves when the actor is awakened.
   */
  async takeAwaken() {
    await oneOffs._takeAwaken(this);
  }

  /**
   * Revives the actor from death.
   * @returns {Promise<void>} Promise that resolves when the actor is revived.
   */
  async takeRevive() {
    await oneOffs._takeRevive(this);
  }

  /**
   * Rolls a condition check for the actor.
   * @param {string} condition - The condition to roll for.
   * @param {Teriock.ConditionRollOptions} options - Options for the condition roll.
   * @returns {Promise<void>} Promise that resolves when the condition roll is complete.
   */
  async rollCondition(condition, options) {
    await _rollCondition(this, condition, options);
  }

  /**
   * Performs post-update operations for the actor.
   * @param {Teriock.SkipFunctions} skipFunctions - Functions that should be skipped.
   * @returns {Promise<void>} Resolves when all post-update operations are complete
   * @returns {Promise<void>} Promise that resolves when post-update is complete.
   */
  async postUpdate(skipFunctions) {
    await _postUpdate(this, skipFunctions);
  }

  /**
   * Rolls a feat save for the specified attribute.
   * @param {string} attribute - The attribute to roll a feat save for.
   * @param {Teriock.} options - Options for the roll.
   * @returns {void}
   */
  rollFeatSave(attribute, options = {}) {
    rollGeneric._rollFeatSave(this, attribute, options);
  }

  /**
   * Rolls a resistance check.
   * @param {Teriock.CommonRollOptions} options - Options for the roll.
   * @returns {void}
   */
  rollResistance(options = {}) {
    rollGeneric._rollResistance(this, options);
  }

  /**
   * Rolls an immunity check.
   * @param {Teriock.CommonRollOptions} options - Options for the roll.
   * @returns {void}
   */
  async rollImmunity(options = {}) {
    await rollGeneric._rollImmunity(this, options);
  }

  /**
   * Rolls a tradecraft check.
   * @param {string} tradecraft - The tradecraft to roll for.
   * @param {Teriock.CommonRollOptions} options - Options for the roll.
   * @returns {void}
   */
  async rollTradecraft(tradecraft, options = {}) {
    await rollGeneric._rollTradecraft(this, tradecraft, options);
  }

  /**
   * Gets roll data for this actor, including all relevant stats and modifiers.
   * @returns {object} The roll data object containing actor stats and modifiers.
   */
  getRollData() {
    return _getRollData(this);
  }
}
