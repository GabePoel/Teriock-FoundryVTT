import { EvaluationField } from "../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles senses.
 * @param {typeof TeriockBaseActorModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockBaseActorModel}
     * @implements {ActorSensesPartInterface}
     * @mixin
     */
    class ActorSensesPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          senses: new fields.SchemaField({
            blind: senseField(0, "Blind Fighting"),
            dark: senseField(0, "Dark Vision"),
            ethereal: senseField(0, "Ethereal Vision"),
            hearing: senseField(0, "Advanced Hearing"),
            invisible: senseField(0, "See Invisible"),
            night: senseField(0, "Night Vision"),
            sight: senseField(0, "Advanced Sight"),
            smell: senseField(0, "Advanced Smell"),
            truth: senseField(0, "True Sight"),
          }),
          detection: new fields.SchemaField({
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
          }),
        });
        return schema;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.light = {
          negative: false,
          priority: 0,
          alpha: 0.5,
          angle: 360,
          bright: 0,
          color: "#000000",
          coloration: 1,
          dim: 0,
          attenuation: 0.5,
          luminosity: 0.5,
          saturation: 0,
          contrast: 0,
          shadows: 0,
          animation: {
            type: null,
            speed: 5,
            intensity: 5,
            reverse: false,
          },
          darkness: {
            min: 0,
            max: 1,
          },
        };
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
    label: `${name} Range`,
    min: 0,
  });
}
