const { fields } = foundry.data;

/**
 * Actor data model that handles scaling.
 * @param {typeof TeriockBaseActorModel} Base
 * @constructor
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {ActorScalingPartInterface}
     * @mixin
     */
    class ActorScalingPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          scaling: new fields.SchemaField({
            lvl: new fields.NumberField({
              initial: 1,
              integer: true,
              label: "Level",
              min: 1,
            }),
            brScale: new fields.BooleanField({
              initial: false,
              label: "Scale off BR",
              hint: "Scale bonuses off BR instead of LVL.",
            }),
          }),
        });
        return schema;
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
        const data = {
          "rank.mag": 0,
          "rank.sem": 0,
          "rank.war": 0,
        };
        for (const k of Object.keys(TERIOCK.index.classes)) {
          data[`rank.${k}`] = 0;
        }
        const keys = Object.keys(data);
        for (const rank of this.parent.itemTypes.rank || []) {
          const classKey =
            "rank." + rank.system.className.slice(0, 3).toLowerCase();
          const archetypeKey =
            "rank." + rank.system.archetype.slice(0, 3).toLowerCase();
          if (classKey && keys.includes(classKey)) {
            data[classKey]++;
          }
          if (archetypeKey && keys.includes(archetypeKey)) {
            data[archetypeKey]++;
          }
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
