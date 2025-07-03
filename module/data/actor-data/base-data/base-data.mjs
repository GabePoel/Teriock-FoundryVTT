/** @import { CommonRollOptions, ConditionRollOptions } from "../../../types/rolls" */
/** @import { HackableBodyPart } from "./types/parameters" */
const { TypeDataModel } = foundry.abstract;
import * as hacks from "./methods/consequences/_take-hacks.mjs";
import * as numericals from "./methods/consequences/_take-numericals.mjs";
import * as oneoffs from "./methods/consequences/_take-oneoffs.mjs";
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
   * @override
   * @returns {object} The schema definition for the actor data.
   */
  static defineSchema() {
    return _defineSchema();
  }

  /**
   * Migrates actor data to the current schema version.
   * @override
   * @param {object} data - The data to migrate.
   * @returns {object} The migrated data.
   */
  static migrateData(data) {
    const start = performance.now();
    data = _migrateData(data);
    const result = super.migrateData(data);
    const end = performance.now();
    console.log(`migrateData took ${end - start} ms`);
    return result;
  }

  /**
   * Prepares derived data for the actor, calculating stats, speeds, and other derived values.
   * @override
   */
  prepareDerivedData() {
    const start = performance.now();
    _prepareDerivedData(this);
    const end = performance.now();
    console.log(`prepareDerivedData took ${end - start} ms`);
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

  /**
   * Gains temporary mana points for the actor.
   * @param {number} amount - The amount of temporary mana points to gain.
   * @returns {Promise<void>} Promise that resolves when temporary mana points are gained.
   */ fetch;
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
   * @param {HackableBodyPart} part - The part to hack.
   * @returns {Promise<void>} Promise that resolves when hack is applied.
   */
  async takeHack(part) {
    await hacks._takeHack(this, part);
  }

  /**
   * Removes hack effect from a specific part of the actor.
   * @param {HackableBodyPart} part - The part to unhack.
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
    await oneoffs._takeAwaken(this);
  }

  /**
   * Revives the actor from death.
   * @returns {Promise<void>} Promise that resolves when the actor is revived.
   */
  async takeRevive() {
    await oneoffs._takeRevive(this);
  }

  /**
   * Rolls a condition check for the actor.
   * @param {string} condition - The condition to roll for.
   * @param {ConditionRollOptions} options - Options for the condition roll.
   * @returns {Promise<void>} Promise that resolves when the condition roll is complete.
   */
  async rollCondition(condition, options) {
    await _rollCondition(this, condition, options);
  }

  /**
   * Performs post-update operations for the actor.
   * @param {SkipFunctions} skipFunctions - Functions that should be skipped.
   * @returns {Promise<void>} Resolves when all post-update operations are complete
   * @returns {Promise<void>} Promise that resolves when post-update is complete.
   */
  async postUpdate(skipFunctions) {
    const start = performance.now();
    await _postUpdate(this, skipFunctions);
    const end = performance.now();
    console.log(`postUpdate took ${end - start} ms`);
  }

  /**
   * Rolls a feat save for the specified attribute.
   * @param {string} attribute - The attribute to roll a feat save for.
   * @param {CommonRollOptions} options - Options for the roll.
   * @returns {void}
   */
  rollFeatSave(attribute, options = {}) {
    rollGeneric._rollFeatSave(this, attribute, options);
  }

  /**
   * Rolls a resistance check.
   * @param {CommonRollOptions} options - Options for the roll.
   * @returns {void}
   */
  rollResistance(options = {}) {
    rollGeneric._rollResistance(this, options);
  }

  /**
   * Rolls an immunity check.
   * @param {CommonRollOptions} options - Options for the roll.
   * @returns {void}
   */
  rollImmunity(options = {}) {
    rollGeneric._rollImmunity(this, options);
  }

  /**
   * Rolls a tradecraft check.
   * @param {string} tradecraft - The tradecraft to roll for.
   * @param {CommonRollOptions} options - Options for the roll.
   * @returns {void}
   */
  rollTradecraft(tradecraft, options = {}) {
    rollGeneric._rollTradecraft(this, tradecraft, options);
  }

  /**
   * Gets roll data for this actor, including all relevant stats and modifiers.
   * @returns {object} The roll data object containing actor stats and modifiers.
   */
  getRollData() {
    return _getRollData(this);
  }
}
