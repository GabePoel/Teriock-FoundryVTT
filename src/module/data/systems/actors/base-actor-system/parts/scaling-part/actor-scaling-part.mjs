const { fields } = foundry.data;

/**
 * Actor data model that handles scaling.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseActorSystem}
     * @implements {ActorScalingPartInterface}
     * @mixin
     */
    class ActorScalingPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          scaling: new fields.SchemaField({
            lvl: new fields.NumberField({
              initial: 1,
              integer: true,
              min: 1,
            }),
            brScale: new fields.BooleanField({ initial: false }),
          }),
        });
      }

      /**
       * Get base roll data.
       * @returns {object}
       */
      #getBaseRollData() {
        return {
          f: this.scaling.f,
          lvl: this.scaling.lvl,
          p: this.scaling.p,
        };
      }

      /**
       * Get rank roll data.
       * @returns {object}
       */
      #getRankRollData() {
        const data = {};
        const ranks = this.parent.itemTypes.rank;
        for (const c of Object.keys(TERIOCK.index.classes)) {
          const count = ranks.filter((r) => r.system.className === c).length;
          data[`rank.${c}`] = count;
          data[`rank.${c.slice(0, 3).toLowerCase()}`] = count;
        }
        for (const a of Object.keys(TERIOCK.options.rank)) {
          const count = ranks.filter((r) => r.system.archetype === a).length;
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
        for (const species of this.parent.itemKeys.species || new Set()) {
          data[`species.${species}`] = 1;
        }
        return data;
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        Object.assign(rollData, {
          ...this.#getBaseRollData(),
          ...this.#getRankRollData(),
          ...this.#getSpeciesRollData(),
        });
        return rollData;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.presence = {
          max: Math.max(1, Math.floor(1 + (this.scaling.lvl + 1) / 5)),
          min: 0,
          overflow: false,
          value: 0,
        };
        this.scaling.br = Math.max(
          ...this.parent.species.map((s) => s.system.br),
        );
        this.scaling.scale = this.scaling.brScale
          ? this.scaling.br
          : this.scaling.lvl;
        this.scaling.rank = Math.max(0, Math.floor((this.scaling.lvl - 1) / 5));
        this.scaling.p = Math.max(
          0,
          Math.floor(1 + (this.scaling.scale - 7) / 10),
        );
        this.scaling.f = Math.max(0, Math.floor((this.scaling.scale - 2) / 5));
      }
    }
  );
};
