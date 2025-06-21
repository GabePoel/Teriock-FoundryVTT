import { _defineApplies } from "./_define-applies.mjs";
import { _defineConsequences } from "./_define-consequences.mjs";
import { _defineGeneral } from "./_define-general.mjs";

/**
 * @returns {object}
 * @private
 */
export function _defineSchema() {
  let schema = {};
  schema = _defineApplies(schema);
  schema = _defineConsequences(schema);
  schema = _defineGeneral(schema);
  return schema;
}
