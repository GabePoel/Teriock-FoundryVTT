import { characterOptions } from "../../../../../../constants/options/character-options.mjs";
import { objectMap } from "../../../../../../helpers/utils.mjs";
import { EvaluationField } from "../../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles senses.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorSensesPartData}
     * @mixin
     */
    class ActorSensesPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          detection: new fields.SchemaField({
            hiding: new EvaluationField({
              blank: characterOptions.defaults.hiding,
              deterministic: true,
              floor: true,
              initial: characterOptions.defaults.hiding,
              min: -Infinity,
            }),
            perceiving: new EvaluationField({
              blank: characterOptions.defaults.perceiving,
              deterministic: true,
              floor: true,
              initial: characterOptions.defaults.perceiving,
              min: -Infinity,
            }),
          }),
          senses: new fields.SchemaField({
            ...objectMap(
              characterOptions.senseTypes,
              (c) => senseField(0, c.label),
              { filter: (c) => !c?.hidden },
            ),
          }),
        });
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this.detection.hiding.evaluate();
        this.detection.perceiving.evaluate();
      }
    }
  );
};

/**
 * Creates a number field for a specific sense.
 * @param {number} initial
 * @param {string} name
 */
function senseField(initial, name) {
  return new fields.NumberField({
    initial: initial,
    integer: true,
    label: name,
    min: 0,
  });
}
