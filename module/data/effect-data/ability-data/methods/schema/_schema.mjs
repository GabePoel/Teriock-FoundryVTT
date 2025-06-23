import { _defineApplies } from "./_define-applies.mjs";
import { _defineConsequences } from "./_define-consequences.mjs";
import { _defineGeneral } from "./_define-general.mjs";

/**
 * Defines the complete schema for Teriock ability data.
 *
 * This function orchestrates the creation of the ability data schema by combining
 * three main schema components:
 *
 * 1. **General Fields**: Core ability properties like interaction type, delivery method,
 *    costs, and basic configuration
 * 2. **Consequences**: Complex consequence system with instant/ongoing effects,
 *    critical overrides, and heightened abilities
 * 3. **Applies**: Data that applies to different proficiency levels (base, proficient, fluent)
 *
 * The schema defines the structure and validation rules for all ability data,
 * ensuring consistency and type safety across the system.
 *
 * @returns {object} Complete ability data schema with all field definitions
 * @private
 *
 * @example
 * // Get the complete ability schema
 * const schema = _defineSchema();
 *
 * @example
 * // Use schema for validation
 * const abilityData = new foundry.data.DataModel(schema, data);
 */
export function _defineSchema() {
  let schema = {};
  schema = _defineApplies(schema);
  schema = _defineConsequences(schema);
  schema = _defineGeneral(schema);
  return schema;
}
