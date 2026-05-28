import { config } from "../../../../../../constants/_module.mjs";
import { objectMap } from "../../../../../../helpers/utils.mjs";
import { initialNumber } from "../../../../../fields/helpers/initializers.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles movement.
 * @param {typeof BaseActorSystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {AbstractActorSystem}
     * @extends {Teriock.Models.ActorMovementPartData}
     * @mixin
     */
    class ActorMovementPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          movementSpeed: initialNumber(30),
          speedAdjustments: new fields.SchemaField(
            objectMap(config.character.movement, e => speedField(e.initial, e.label)),
          ),
        });
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        rollData.speed = this.movementSpeed;
        for (const [k, v] of Object.entries(config.character.movement)) {
          rollData[`speed.${v.abbreviation}`] = this.speedAdjustments[k] || 0;
        }
        return rollData;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.movementSpeed = 30 + 10 * this.attributes.mov.score;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this.movementSpeed = 30 + 10 * this.attributes.mov.score;
      }

      /** @inheritDoc */
      prepareVirtualEffects() {
        super.prepareVirtualEffects();
        for (const key of Object.keys(this.speedAdjustments)) {
          if (this.parent.statuses.has("slowed")) { this.speedAdjustments[key] -= 1; }
          if (this.parent.statuses.has("immobilized")) { this.speedAdjustments[key] = 0; }
          this.speedAdjustments[key] = Math.max(this.speedAdjustments[key], 0);
        }
      }
    }
  );
};

/**
 * Creates a speed adjustment field definition for different movement types.
 *
 * Relevant wiki pages:
 * - [Movement Speed](https://wiki.teriock.com/index.php/Core:Movement_Speed)
 *
 * @param {number} initial - The initial speed adjustment value (0-4)
 * @param {string} name - The display name for this speed adjustment type
 */
function speedField(initial, name) {
  return new fields.NumberField({
    initial,
    integer: true,
    label: `${name} Speed Adjustment`,
    max: 4,
    min: 0,
    persisted: false,
    step: 1,
  });
}
