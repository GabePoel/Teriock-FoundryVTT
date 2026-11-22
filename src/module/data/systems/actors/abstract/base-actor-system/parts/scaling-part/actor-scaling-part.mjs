import { initialBoolean, initialNumber, initialSchema } from "../../../../../../fields/tools/initializers.mjs";

/**
 * @import AbstractActorSystem from "../../abstract-actor-system.mjs";
 */

const { fields } = foundry.data;

/**
 * Actor data model that handles scaling.
 *
 * Relevant wiki pages:
 * - [Leveling Up](https://wiki.teriock.com/index.php/Core:Leveling_Up)
 * - [Battle Rating](https://wiki.teriock.com/index.php/Core:Battle_Rating)
 *
 * @template {MixinBase<typeof AbstractActorSystem>} T
 * @param {T} Base
 */
export default function ActorScalingPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.ActorScalingPartData}
   * @property {TeriockActor} parent
   */
  class ActorScalingPart extends /** @type {InitializedDataModel<T, Teriock.Models.ActorScalingPartData>} */ (Base) {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        presence: initialSchema({
          max: initialNumber(TERIOCK.CONFIG.actor.defaults.maxPresence),
          min: initialNumber(),
          over: initialBoolean(),
          value: initialNumber(),
        }),
        scaling: new fields.SchemaField({
          basis: new fields.StringField({
            blank: false,
            choices: TERIOCK.CONFIG.actor.scalingBases,
            initial: "lvl",
            required: true,
          }),
          br: new fields.NumberField({ initial: null, nullable: true }),
          f: initialNumber(),
          lvl: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
          p: initialNumber(),
          rank: initialNumber(),
          scale: initialNumber(),
        }),
      });
    }

    /** @inheritDoc */
    static migrateData(source, options) {
      foundry.abstract.Document._addDataFieldMigration(
        source,
        "scaling.brScale",
        "scaling.basis",
        d => (foundry.utils.getProperty(d, "scaling.brScale") ? "br" : "lvl"),
      );
      return super.migrateData(source, options);
    }

    /**
     * Get rank roll data.
     * @returns {object}
     */
    #getRankRollData() {
      const data = {};
      const ranks = this.parent.previewedTypes.rank;
      for (const c of Object.keys(TERIOCK.CONFIG.class.classes)) {
        data[`ranks.class.${c}`] = ranks.filter(r => r.system.class === c).length;
      }
      for (const a of Object.keys(TERIOCK.CONFIG.class.archetypes)) {
        data[`ranks.archetype.${a}`] = ranks.filter(r => r.system.archetype === a).length;
      }
      return data;
    }

    /**
     * Get species roll data.
     * @returns {object}
     */
    #getSpeciesRollData() {
      const data = { undead: 0 };
      for (const s of this.parent.previewedTypes.species.filter(s => s.active)) {
        data[`species.${s.system.slug}`] = 1;
        for (const f of s.system.families) { data[`family.${f}`] = 1; }
        for (const t of s.system.traits) { data[`trait.${t}`] = 1; }
        data.undead = Math.max(data.undead, s.system.undeadLevel);
      }
      return data;
    }

    /** @inheritDoc */
    getRollData() {
      const rollData = super.getRollData();
      Object.assign(rollData, {
        br: this.scaling.br,
        f: this.scaling.f,
        lvl: this.scaling.lvl,
        p: this.scaling.p,
        scale: this.scaling.scale,
        ...this.#getRankRollData(),
        ...this.#getSpeciesRollData(),
      });
      return rollData;
    }

    /** @inheritDoc */
    prepareBaseData() {
      this.scaling.br ??= Math.max(0, ...this.parent.previewedTypes.species.map(s => s.system.br));
      this.scaling.scale = this.scaling[this.scaling.basis];
      this.presence.max = Math.max(
        TERIOCK.CONFIG.actor.defaults.maxPresence,
        Math.floor(1 + (this.scaling.scale + 1) / 5),
      );
      this.scaling.rank = Math.max(0, Math.floor((this.scaling.lvl - 1) / 5));
      this.scaling.p = Math.max(
        TERIOCK.CONFIG.actor.defaults.p,
        Math.floor(TERIOCK.CONFIG.actor.defaults.p + 1 + (this.scaling.scale - 7) / 10),
      );
      this.scaling.f = Math.max(
        TERIOCK.CONFIG.actor.defaults.f,
        Math.floor(TERIOCK.CONFIG.actor.defaults.f + (this.scaling.scale - 2) / 5),
      );
      super.prepareBaseData();
    }
  }

  return ActorScalingPart;
}
