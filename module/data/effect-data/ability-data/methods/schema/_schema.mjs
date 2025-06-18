import { _defineApplies } from "./_define-applies.mjs";
import { _defineGeneral } from "./_define-general.mjs";

/**
 * @returns {object}
 * @private
 */
export function _defineSchema() {
  let schema = {};
  schema = _defineGeneral(schema);
  schema = _defineApplies(schema);
  return schema;
}