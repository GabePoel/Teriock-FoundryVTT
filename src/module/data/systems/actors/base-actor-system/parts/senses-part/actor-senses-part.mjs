import { config } from "../../../../../../constants/_module.mjs";
import { objectMap } from "../../../../../../helpers/utils.mjs";
import { InfiniteNumberField } from "../../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles senses.
 *
 * Relevant wiki pages:
 * - [Hidden](https://wiki.teriock.com/index.php/Condition:Hidden)
 * - [Perceive](https://wiki.teriock.com/index.php/Ability:Perceive)
 * - [Perception](https://wiki.teriock.com/index.php/Core:Perception)
 * - [Sensory effects](https://wiki.teriock.com/index.php/Category:Sensory_effects)
 * - [Sneak](https://wiki.teriock.com/index.php/Core:Sneak)
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ActorSensesPart & Teriock.Models.ActorSensesPartData>}
 */
export default function ActorSensesPart(Base) {
  /**
   * @implements {Teriock.Models.ActorSensesPartData}
   * @mixin
   * @property {TeriockActor} parent
   */
  class ActorSensesPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        detection: new fields.SchemaField({
          hiding: new fields.NumberField({
            initial: null,
            integer: true,
            nullable: true,
            placeholder: _loc("TERIOCK.ROLL_CONTEXT.Mod.passive", {
              name: _loc("TERIOCK.TERMS.Attributes.snk.abbreviation"),
            }),
          }),
          perceiving: new fields.NumberField({
            initial: null,
            integer: true,
            nullable: true,
            placeholder: _loc("TERIOCK.ROLL_CONTEXT.Mod.passive", {
              name: _loc("TERIOCK.TERMS.Attributes.per.abbreviation"),
            }),
          }),
        }),
        senses: new fields.SchemaField({
          ...objectMap(config.character.sense, c => senseField(0, c.label), { filter: c => !c?.hidden }),
        }),
      });
    }

    /** @type {number} */
    #cachedHidingScore;

    /** @type {number} */
    #cachedPerceivingScore;

    /** @inheritDoc */
    getRollData() {
      const rollData = super.getRollData();
      Object.assign(rollData, {
        "detection.hiding": this.detection.hiding ?? this.attributes.snk.passive,
        "detection.perceiving": this.detection.perceiving ?? this.attributes.per.passive,
      });
      return rollData;
    }

    /** @inheritDoc */
    prepareCleanupData() {
      this.detection.hiding ??= this.attributes.snk.passive;
      this.detection.perceiving ??= this.attributes.per.passive;
      const hidingChange = this.#cachedHidingScore !== this.detection.hiding;
      const perceivingChange = this.#cachedPerceivingScore !== this.detection.perceiving;
      if (hidingChange || perceivingChange) {
        /** @type {TeriockToken[]} */
        const tokens = this.actor.getDependentTokens({ scenes: canvas.scene }).filter(t => t.rendered).map(t =>
          t.object
        );
        for (const token of tokens) {
          if (hidingChange) { token._onChangeHidingScore(); }
          if (perceivingChange) { token._onChangePerceivingScore(); }
        }
      }
      super.prepareCleanupData();
      this.#cachedHidingScore = this.detection.hiding;
      this.#cachedPerceivingScore = this.detection.perceiving;
    }
  }

  return ActorSensesPart;
}

/**
 * Creates a number field for a specific sense.
 * @param {number} initial
 * @param {string} name
 * @returns {InfiniteNumberField}
 */
function senseField(initial, name) {
  return new InfiniteNumberField({ initial, integer: true, label: name });
}
