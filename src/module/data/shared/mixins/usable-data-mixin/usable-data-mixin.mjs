import { CompetenceModel } from "../../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * Mixin for data models that can be used. This typically involves running an execution.
 * @param {typeof EmbeddedDataModel | typeof CommonSystem} Base
 */
export default function UsableDataMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {EmbeddedDataModel|CommonSystem}
     * @implements {Teriock.Models.UsableDataInterface}
     * @mixin
     */
    class UsableData extends Base {
      /** @inheritDoc */
      static defineSchema(...args) {
        return Object.assign(super.defineSchema(...args), {
          competence: new fields.EmbeddedDataField(CompetenceModel),
        });
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
       * Parse an event into usable roll or execution options for this type.
       * @param {PointerEvent} _event
       * @returns {Teriock.Execution.DocumentExecutionOptions}
       */
      static parseEvent(_event) {
        return {};
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
          flu: Number(this.competence.fluent),
          pro: Number(this.competence.proficient),
        };
      }

      /**
       * Parse an event into usable roll or execution options for this instance.
       * @param {PointerEvent} event
       * @returns {Teriock.Execution.DocumentExecutionOptions}
       */
      parseEvent(event) {
        return Object.assign(this.constructor.parseEvent(event), {
          source: this.parent,
        });
      }

      /**
       * Uses this, including all hook and pseudo-hook calls.
       * @param {Teriock.Interaction.UseOptions} options
       * @returns {Promise<void>}
       */
      async use(options = {}) {
        if (options.event) {
          Object.assign(options, this.parseEvent(options.event));
          delete options.event;
        }
        await this._use(options);
      }
    }
  );
}
