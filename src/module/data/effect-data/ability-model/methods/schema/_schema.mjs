import { _defineConsumable } from "./_define-consumable.mjs";
import { _defineGeneral } from "./_define-general.mjs";
import { _defineImpacts } from "./_define-impacts.mjs";

/**
 * Defines the complete schema for Teriock ability data.
 *
 * This function orchestrates the creation of the ability data schema by combining
 * three main schema parts:
 *
 * 1. **General Fields**: Core ability properties like interaction type, delivery method,
 *    costs, and basic configuration.
 * 2. **Consequences**: Data that applies to different proficiency levels (base, proficient, fluent).
 * 3. **Consumable**: Data relating to consumable abilities.
 *
 * The schema defines the structure and validation rules for all ability data,
 * ensuring consistency and type safety across the system.
 *
 * @returns {object} Complete ability data schema with all field definitions
 * @private
 */
export function _defineSchema() {
  let schema = {};
  schema = _defineImpacts(schema);
  schema = _defineGeneral(schema);
  schema = _defineConsumable(schema);
  return schema;
}
