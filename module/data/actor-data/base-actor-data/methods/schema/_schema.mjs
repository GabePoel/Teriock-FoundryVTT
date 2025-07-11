import { _defineBasics } from "./_define-basics.mjs";
import { _defineCapacities } from "./_define-capacities.mjs";
import { _defineCombat } from "./_define-combat.mjs";
import { _defineDamage } from "./_define-damage.mjs";
import { _defineHacks } from "./_define-hacks.mjs";
import { _defineMoney } from "./_define-money.mjs";
import { _defineProtections } from "./_define-protections.mjs";
import { _defineSenses } from "./_define-senses.mjs";
import { _defineSheet } from "./_define-sheet.mjs";
import { _defineSpeed } from "./_define-speed.mjs";
import { _defineStats } from "./_define-stats.mjs";
import { _defineTradecrafts } from "./_define-tradecrafts.mjs";

/**
 * Defines the complete base actor schema by combining all individual schema components.
 *
 * This function orchestrates the creation of a comprehensive actor data schema by
 * calling all the individual schema definition functions in the correct order.
 *
 * @returns {Object} The complete base actor schema containing all defined fields
 *
 * @example
 * ```javascript
 * const baseActorSchema = _defineSchema();
 * // baseActorSchema now contains all actor fields from all schema components
 * ```
 *
 * @typedef {Object} BaseActorSchema
 * @property {Object} lvl - Level field from {@link _defineBasics}
 * @property {Object} size - Size field from {@link _defineBasics}
 * @property {Object} attributes - Attributes field from {@link _defineBasics}
 * @property {Object} movementSpeed - Movement speed from {@link _defineCapacities}
 * @property {Object} carryingCapacity - Carrying capacity from {@link _defineCapacities}
 * @property {Object} weight - Weight field from {@link _defineCapacities}
 * @property {Object} wornAc - Worn armor class from {@link _defineCombat}
 * @property {Object} naturalAv - Natural armor value from {@link _defineCombat}
 * @property {Object} attackPenalty - Attack penalty from {@link _defineCombat}
 * @property {Object} sb - Style bonus from {@link _defineCombat}
 * @property {Object} piercing - Piercing ability from {@link _defineCombat}
 * @property {Object} damage - Damage types from {@link _defineDamage}
 * @property {Object} hacks - Body part hacks from {@link _defineHacks}
 * @property {Object} money - Currency types from {@link _defineMoney}
 * @property {Object} moneyWeight - Money weight from {@link _defineMoney}
 * @property {Object} senses - Sense ranges from {@link _defineSenses}
 * @property {Object} speedAdjustments - Speed adjustments from {@link _defineSpeed}
 * @property {Object} hp - Health points from {@link _defineStats}
 * @property {Object} mp - Mana points from {@link _defineStats}
 * @property {Object} wither - Wither stat from {@link _defineStats}
 * @property {Object} presence - Presence stat from {@link _defineStats}
 * @property {Object} tradecrafts - Tradecraft skills from {@link _defineTradecrafts}
 * @property {Object} sheet - Sheet configuration from {@link _defineSheet}
 * @private
 */
export function _defineSchema() {
  let schema = {};
  schema = _defineBasics(schema);
  schema = _defineCapacities(schema);
  schema = _defineCombat(schema);
  schema = _defineDamage(schema);
  schema = _defineHacks(schema);
  schema = _defineMoney(schema);
  schema = _defineProtections(schema);
  schema = _defineSenses(schema);
  schema = _defineSheet(schema);
  schema = _defineSpeed(schema);
  schema = _defineStats(schema);
  schema = _defineTradecrafts(schema);
  return schema;
}
