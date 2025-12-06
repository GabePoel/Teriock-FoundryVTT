import { EvaluationField } from "../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Defines the detections schema.
 * @param {object} schema
 * @returns {object}
 * @private
 */
export function _defineDetection(schema) {
  schema.detection = new fields.SchemaField({
    hiding: new EvaluationField({
      blank: "@snk.pas",
      floor: true,
      initial: "@snk.pas",
    }),
    perceiving: new EvaluationField({
      blank: "@per.pas",
      floor: true,
      initial: "@per.pas",
    }),
  });
  return schema;
}
