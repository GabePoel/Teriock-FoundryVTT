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
     * @extends {Teriock.Models.ActorSensesPartInterface}
     * @mixin
     */
    class ActorSensesPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          // TODO: Consider moving all senses to token in v14.
          senses: new fields.SchemaField({
            ...objectMap(characterOptions.senses, (o) => senseField(0, o)),
          }),
          detection: new fields.SchemaField({
            hiding: new EvaluationField({
              blank: characterOptions.defaults.hiding,
              deterministic: true,
              floor: true,
              initial: characterOptions.defaults.hiding,
            }),
            perceiving: new EvaluationField({
              blank: characterOptions.defaults.perceiving,
              deterministic: true,
              floor: true,
              initial: characterOptions.defaults.perceiving,
            }),
          }),
        });
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        // TODO: Move light controls to token overrides in v14.
        this.light = foundry.utils.deepClone(characterOptions.defaultLight);
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this.detection.hiding.evaluate();
        this.detection.perceiving.evaluate();
        // TODO: Move light controls to token overrides in v14.
        if (this.parent.statuses.has("ethereal")) {
          this.senses.etherealLight = Math.max(
            this.light.dim || 0,
            this.light.bright || 0,
          );
        } else {
          this.senses.etherealLight = 0;
        }
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
