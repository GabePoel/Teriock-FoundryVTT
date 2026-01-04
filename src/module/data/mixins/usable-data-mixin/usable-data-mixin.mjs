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
          proficient: new fields.BooleanField({
            initial: false,
            label: "Proficient",
          }),
          fluent: new fields.BooleanField({
            initial: false,
            label: "Fluent",
          }),
        });
        return schema;
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
