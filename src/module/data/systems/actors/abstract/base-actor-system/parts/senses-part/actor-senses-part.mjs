import { objectMap } from "../../../../../../../utils/_module.mjs";
import { InfiniteNumberField } from "../../../../../../fields/_module.mjs";

/**
 * @import AbstractActorSystem from "../../abstract-actor-system.mjs";
 */

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
 * @template {MixinBase<typeof AbstractActorSystem>} T
 * @param {T} Base
 * @category Perception
 */
export default function ActorSensesPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.ActorSensesPartData}
   * @property {TeriockActor} parent
   */
  class ActorSensesPart extends /** @type {InitializedDataModel<T, Teriock.Models.ActorSensesPartData>} */ (Base) {
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
          ...objectMap(TERIOCK.CONFIG.character.sense, c => senseField(0, c.label), { filter: c => !c?.hidden }),
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

    /** @inheritDoc */
    prepareCleanupData() {
      this.detection.hiding ??= this.attributes.snk.passive;
      this.detection.perceiving ??= this.attributes.per.passive;
      const cache = this.parent._cache;
      const hidingChange = cache.hiding !== this.detection.hiding;
      const perceivingChange = cache.perceiving !== this.detection.perceiving;
      if (hidingChange || perceivingChange) {
        for (const token of /** @type {TeriockToken[]} */ (this.actor.getActiveTokens())) {
          if (hidingChange) { token._onChangeHidingScore(); }
          if (perceivingChange) { token._onChangePerceivingScore(); }
        }
      }
      super.prepareCleanupData();
      cache.hiding = this.detection.hiding;
      cache.perceiving = this.detection.perceiving;
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
  return new InfiniteNumberField({ initial, integer: true, label: name, units: "TERIOCK.LENGTH.ft.symbol" });
}
