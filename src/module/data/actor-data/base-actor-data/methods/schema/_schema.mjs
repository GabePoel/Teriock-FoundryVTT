import { _defineAttributes } from "./_define-attributes.mjs";
import { _defineCapacities } from "./_define-capacities.mjs";
import { _defineCombat } from "./_define-combat.mjs";
import { _defineDeathBag } from "./_define-death-bag.mjs";
import { _defineMoney } from "./_define-money.mjs";
import { _defineProtections } from "./_define-protections.mjs";
import { _defineSenses } from "./_define-senses.mjs";
import { _defineSheet } from "./_define-sheet.mjs";
import { _defineSpeed } from "./_define-speed.mjs";
import { _defineStats } from "./_define-stats.mjs";
import { _defineTradecrafts } from "./_define-tradecrafts.mjs";
import { _defineTransformation } from "./_define-transformation.mjs";

/**
 * Defines the complete base actor schema by combining all individual schema components.
 * This function orchestrates the creation of a comprehensive actor data schema by
 * calling all the individual schema definition functions in the correct order.
 * @param {object} schema
 * @returns {object} The complete base actor schema containing all defined fields
 */
export function _defineSchema(schema) {
  schema = _defineAttributes(schema);
  schema = _defineCapacities(schema);
  schema = _defineCombat(schema);
  schema = _defineDeathBag(schema);
  schema = _defineMoney(schema);
  schema = _defineProtections(schema);
  schema = _defineSenses(schema);
  schema = _defineSheet(schema);
  schema = _defineSpeed(schema);
  schema = _defineStats(schema);
  schema = _defineTradecrafts(schema);
  schema = _defineTransformation(schema);
  return schema;
}
