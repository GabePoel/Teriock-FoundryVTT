import { config } from "../../../../../../constants/_module.mjs";
import { objectMap } from "../../../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles senses.
 * @param {typeof BaseActorSystem} Base
 */
export default function ActorSensesPart(Base) {
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
            hiding: new fields.NumberField({ initial: null, integer: true, nullable: true }),
            perceiving: new fields.NumberField({ initial: null, integer: true, nullable: true }),
          }),
          senses: new fields.SchemaField({
            ...objectMap(config.character.sense, c => senseField(0, c.label), { filter: c => !c?.hidden }),
          }),
        });
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        Object.assign(rollData, {
          "detection.hiding": this.detection.hiding ?? this.attributes.snk.passive,
          "detection.perceiving": this.detection.perceiving ?? this.attributes.per.passive,
        });
        return rollData;
      }
    }
  );
}

/**
 * Creates a number field for a specific sense.
 * @param {number} initial
 * @param {string} name
 */
function senseField(initial, name) {
  return new fields.NumberField({ initial, integer: true, label: name, min: 0 });
}
