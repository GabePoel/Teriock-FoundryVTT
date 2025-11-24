import { _defineConsumable } from "./_define-consumable.mjs";
import { _defineGeneral } from "./_define-general.mjs";
import { _defineImpacts } from "./_define-impacts.mjs";

/**
 * Construct a complete ability schema.
 * @returns {object}
 * @private
 */
export function _defineSchema() {
  let schema = {};
  schema = _defineImpacts(schema);
  schema = _defineGeneral(schema);
  schema = _defineConsumable(schema);
  return schema;
}
