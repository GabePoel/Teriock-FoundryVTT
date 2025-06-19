/** @import { CommonRollOptions, ConditionRollOptions } from "../../../types/rolls" */
const { TypeDataModel } = foundry.abstract;
import {
  _takeDamage,
  _takeDrain,
  _takeHeal,
  _takeRevitalize,
  _takeWither,
} from "./methods/consequences/_take-numericals.mjs";
import { _defineSchema } from "./methods/schema/_schema.mjs";
import { _getRollData } from "./methods/_roll-data.mjs";
import { _postUpdate } from "./methods/_post-update.mjs";
import { _prepareDerivedData } from "./methods/data-deriving/_data-deriving.mjs";
import { _rollCondition } from "./methods/rolling/_roll-condition.mjs";
import { _rollFeatSave, _rollResistance, _rollTradecraft } from "./methods/rolling/_roll-generic.mjs";
import { _takeHack, _takeUnhack } from "./methods/consequences/_take-hacks.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";

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
    data = _migrateData(data);
    return super.migrateData(data);
  }

  /** @override */
  prepareDerivedData() {
    _prepareDerivedData(this);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeDamage(amount) {
    await _takeDamage(this, amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeDrain(amount) {
    await _takeDrain(this, amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeWither(amount) {
    await _takeWither(this, amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeHeal(amount) {
    await _takeHeal(this, amount);
  }

  /**
   * @param {number} amount
   * @returns {Promise<void>}
   */
  async takeRevitalize(amount) {
    await _takeRevitalize(this, amount);
  }

  /**
   * @param {string} part
   * @returns {Promise<void>}
   */
  async takeHack(part) {
    await _takeHack(this, part);
  }

  /**
   * @param {string} part
   * @returns {Promise<void>}
   */
  async takeUnhack(part) {
    await _takeUnhack(this, part);
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
    await _postUpdate(this);
  }

  /**
   * @param {string} attribute
   * @param {CommonRollOptions} options
   * @returns {Promise<void>}
   */
  rollFeatSave(attribute, options = {}) {
    _rollFeatSave(this, attribute, options);
  }

  /**
   * @param {CommonRollOptions} options
   * @returns {Promise<void>}
   */
  rollResistance(options = {}) {
    _rollResistance(this, options);
  }

  /**
   * @param {string} tradecraft
   * @param {CommonRollOptions} options
   * @returns {Promise<void>}
   */
  rollTradecraft(tradecraft, options = {}) {
    _rollTradecraft(this, tradecraft, options);
  }

  /**
   * @returns {object}
   */
  getRollData() {
    return _getRollData(this);
  }
}
