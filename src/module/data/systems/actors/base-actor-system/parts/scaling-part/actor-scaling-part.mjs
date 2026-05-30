import { config } from "../../../../../../constants/_module.mjs";
import { toCamelCase } from "../../../../../../helpers/string.mjs";
import { initialBoolean, initialNumber, initialSchema } from "../../../../../fields/helpers/initializers.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles scaling.
 * @param {typeof BaseActorSystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorScalingPartData}
     * @mixin
     */
    class ActorScalingPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          presence: initialSchema({
            max: initialNumber(config.character.defaults.maxPresence),
            min: initialNumber(),
            over: initialBoolean(),
            value: initialNumber(),
          }),
          scaling: new fields.SchemaField({
            br: initialNumber(),
            brScale: new fields.BooleanField({ initial: false }),
            f: initialNumber(),
            lvl: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
            p: initialNumber(),
            rank: initialNumber(),
            scale: initialNumber(),
          }),
        });
      }

      /**
       * Get rank roll data.
       * @returns {object}
       */
      #getRankRollData() {
        const data = {};
        const ranks = this.parent.ranks;
        for (const c of Object.keys(TERIOCK.index.classes)) {
          const count = ranks.filter(r => toCamelCase(r.system._source.class) === c).length;
          data[`rank.${c}`] = count;
          data[`rank.${c.slice(0, 3).toLowerCase()}`] = count;
        }
        for (const a of Object.keys(TERIOCK.config.class.archetypes)) {
          const count = ranks.filter(r => r.system._source.archetype === a).length;
          data[`rank.${a}`] = count;
          data[`rank.${a.slice(0, 3).toLowerCase()}`] = count;
        }
        return data;
      }

      /**
       * Get species roll data.
       * @returns {object}
       */
      #getSpeciesRollData() {
        const data = {};
        for (
          const s of this.parent.species.filter(s => s.active && s.system.identifier)
        ) { data[`species.${s.system.identifier}`] = 1; }
        return data;
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        Object.assign(rollData, {
          ...this.getScalingRollData(),
          ...this.#getRankRollData(),
          ...this.#getSpeciesRollData(),
        });
        return rollData;
      }

      /**
       * Get base roll data.
       * @returns {object}
       */
      getScalingRollData() {
        return { f: this.scaling.f, lvl: this.scaling.lvl, p: this.scaling.p };
      }

      /** @inheritDoc */
      prepareBaseData() {
        this.presence.max = Math.max(config.character.defaults.maxPresence, Math.floor(1 + (this.scaling.lvl + 1) / 5));
        this.scaling.br = Math.max(0, ...this.parent.species.map(s => s.system.br));
        this.scaling.scale = this.scaling.brScale ? this.scaling.br : this.scaling.lvl;
        this.scaling.rank = Math.max(0, Math.floor((this.scaling.lvl - 1) / 5));
        this.scaling.p = Math.max(
          TERIOCK.config.scaling.baseValues.p,
          Math.floor(TERIOCK.config.scaling.baseValues.p + 1 + (this.scaling.scale - 7) / 10),
        );
        this.scaling.f = Math.max(
          TERIOCK.config.scaling.baseValues.f,
          Math.floor(TERIOCK.config.scaling.baseValues.f + (this.scaling.scale - 2) / 5),
        );
        super.prepareBaseData();
      }
    }
  );
};
