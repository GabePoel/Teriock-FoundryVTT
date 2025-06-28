/** @import { CommonRollOptions, ConditionRollOptions } from "../../../types/rolls" */
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
 * @extends {TypeDataModel}
 */
export default class TeriockBaseActorData extends TypeDataModel {
  /** @override */
  static defineSchema() {
    return _defineSchema();
  }

  /** @override */
  static migrateData(data) {
    const start = performance.now();
    data = _migrateData(data);
    const result = super.migrateData(data);
    const end = performance.now();
    console.log(`migrateData took ${end - start} ms`);
    return result;
  }

  /** @override */
  prepareDerivedData() {
    const start = performance.now();
    _prepareDerivedData(this);
    const end = performance.now();
    console.log(`prepareDerivedData took ${end - start} ms`);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeDamage(amount) {
    await numericals._takeDamage(this, amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeDrain(amount) {
    await numericals._takeDrain(this, amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeWither(amount) {
    await numericals._takeWither(this, amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeHeal(amount) {
    await numericals._takeHeal(this, amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeRevitalize(amount) {
    await numericals._takeRevitalize(this, amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeSetTempHp(amount) {
    await numericals._takeSetTempHp(this, amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeSetTempMp(amount) {
    await numericals._takeSetTempMp(this, amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeGainTempHp(amount) {
    await numericals._takeGainTempHp(this, amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeGainTempMp(amount) {
    await numericals._takeGainTempMp(this, amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeSleep(amount) {
    await numericals._takeSleep(this, amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeKill(amount) {
    await numericals._takeKill(this, amount);
  }

  /**
   * @param {string} part
   * @returns {Promise<void>}
   */
  async takeHack(part) {
    await hacks._takeHack(this, part);
  }

  /**
   * @param {string} part
   * @returns {Promise<void>}
   */
  async takeUnhack(part) {
    await hacks._takeUnhack(this, part);
  }

  /**
   * @returns {Promise<void>}
   */
  async takeAwaken() {
    await oneoffs._takeAwaken(this);
  }

  /**
   * @returns {Promise<void>}
   */
  async takeRevive() {
    await oneoffs._takeRevive(this);
  }

  /**
   * @param {ConditionRollOptions} condition
   * @returns {Promise<void>}
   */
  async rollCondition(condition, options) {
    await _rollCondition(this, condition, options);
  }

  /**
   * @returns {Promise<void>}
   */
  async postUpdate() {
    const start = performance.now();
    await _postUpdate(this);
    const end = performance.now();
    console.log(`postUpdate took ${end - start} ms`);
  }

  /**
   * @param {string} attribute
   * @param {CommonRollOptions} options
   */
  rollFeatSave(attribute, options = {}) {
    rollGeneric._rollFeatSave(this, attribute, options);
  }

  /**
   * @param {CommonRollOptions} options
   */
  rollResistance(options = {}) {
    rollGeneric._rollResistance(this, options);
  }

  /**
   * @param {CommonRollOptions} options
   */
  rollImmunity(options = {}) {
    rollGeneric._rollImmunity(this, options);
  }

  /**
   * @param {string} tradecraft
   * @param {CommonRollOptions} options
   */
  rollTradecraft(tradecraft, options = {}) {
    rollGeneric._rollTradecraft(this, tradecraft, options);
  }

  /**
   * @returns {object}
   */
  getRollData() {
    return _getRollData(this);
  }
}
