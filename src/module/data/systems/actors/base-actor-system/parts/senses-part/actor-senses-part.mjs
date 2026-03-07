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
          senses: new fields.SchemaField({
            ...objectMap(characterOptions.senses, (o) => senseField(0, o)),
          }),
          detection: new fields.SchemaField({
            hiding: new EvaluationField({
              blank: "@snk.pas",
              deterministic: true,
              floor: true,
              initial: "@snk.pas",
            }),
            perceiving: new EvaluationField({
              blank: "@per.pas",
              deterministic: true,
              floor: true,
              initial: "@per.pas",
            }),
          }),
        });
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.light = foundry.utils.deepClone(characterOptions.defaultLight);
        if (!this.detection.hiding.raw) {
          this.detection.hiding.raw = "@snk.pas";
        }
        if (!this.detection.perceiving.raw) {
          this.detection.perceiving.raw = "@per.pas";
        }
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this.detection.hiding.evaluate();
        this.detection.perceiving.evaluate();
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
