import mathConfig from "../../../../constants/config/math-config.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { FormulaField } from "../../../fields/_module.mjs";
import { rollableFormulaField } from "../../../fields/helpers/builders.mjs";
import TypedPseudoDocument from "../../abstract/typed-pseudo-document.mjs";

const { fields } = foundry.data;

/**
 * @extends {Teriock.Expirations.BaseExpirationData}
 */
export default class BaseExpiration extends TypedPseudoDocument {
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { label: _loc("TERIOCK.EXPIRATIONS.Base.LABEL") });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      method: new fields.StringField({
        blank: false,
        choices: {
          automatic: _loc("TERIOCK.EXPIRATIONS.Base.METHOD.automatic"),
          roll: _loc("TERIOCK.EXPIRATIONS.Base.METHOD.roll"),
        },
        initial: "automatic",
        required: true,
      }),
      result: new fields.StringField({
        blank: false,
        choices: {
          delete: _loc("TERIOCK.EXPIRATIONS.Base.RESULT.delete"),
          disable: _loc("TERIOCK.EXPIRATIONS.Base.RESULT.disable"),
        },
        initial: "delete",
        required: true,
      }),
      roll: new fields.SchemaField({
        comparison: new fields.StringField({
          blank: false,
          choices: objectMap(mathConfig.comparisons, (c) => c.label, { localize: true }),
          initial: "gte",
          required: true,
        }),
        formula: new rollableFormulaField({ initial: "2d4kh1" }),
        threshold: new FormulaField({ initial: "4" }),
      }),
    });
  }
}
