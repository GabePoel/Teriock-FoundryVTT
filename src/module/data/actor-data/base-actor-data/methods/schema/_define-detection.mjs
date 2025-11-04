import { modifiableFormula } from "../../../../shared/fields/modifiable.mjs";

const { fields } = foundry.data;

/**
 * Defines the detections schema.
 * @param {object} schema
 * @returns {object}
 * @private
 */
export function _defineDetection(schema) {
  schema.detection = new fields.SchemaField({
    hiding: modifiableFormula({
      deterministic: true,
    }),
    perceiving: modifiableFormula({
      deterministic: true,
    }),
  });
  return schema;
}
