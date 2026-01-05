import { CompetenceModel } from "../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * Mixin for data models that can be used. This typically involves running an execution.
 * @param {typeof EmbeddedDataModel | typeof CommonTypeModel} Base
 */
export default function UsableDataMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {EmbeddedDataModel | CommonTypeModel}
     * @implements {Teriock.Models.UsableMixinInterface}
     * @mixin
     */
    class UsableData extends Base {
      /** @inheritDoc */
      static defineSchema(...args) {
        const schema = super.defineSchema(...args);
        Object.assign(schema, {
          competence: new fields.EmbeddedDataField(CompetenceModel),
        });
        return schema;
      }

      /** @inheritDoc */
      static migrateData(data) {
        if (data.proficient) data.competence = { raw: 1 };
        if (data.fluent) data.competence = { raw: 2 };
        delete data.proficient;
        delete data.fluent;
        return super.migrateData(data);
      }

      /**
       * An icon that represents using this.
       * @returns {string}
       */
      get useIcon() {
        return "dice-d20";
      }

      /**
       * A string that represents using this.
       * @returns {string}
       */
      get useText() {
        return `Use This`;
      }

      /**
       * Use this without any hook or pseudo-hook calls.
       * @param {object} _options
       * @returns {Promise<void>}
       */
      async _use(_options = {}) {}

      /** @inheritDoc */
      getLocalRollData() {
        return {
          ...super.getLocalRollData(),
          flu: Number(this.fluent),
          pro: Number(this.proficient),
        };
      }

      /**
       * Uses this, including all hook and pseudo-hook calls.
       * @param {object} options
       * @returns {Promise<void>}
       */
      async use(options = {}) {
        await this._use(options);
      }
    }
  );
}
