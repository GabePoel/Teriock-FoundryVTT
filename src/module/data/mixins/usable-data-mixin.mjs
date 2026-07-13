import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { CompetenceModel } from "../models/_module.mjs";

const { fields } = foundry.data;

/**
 * Mixin for data models that can be used. This typically involves running an execution.
 * @param {typeof BaseDataModel | typeof CommonSystem} Base
 */
export default function UsableDataMixin(Base) {
  return (
    /**
     * @extends {BaseDataModel|CommonSystem}
     * @mixin
     */
    class UsableData extends Base {
      /**
       * The type of execution this uses.
       * @typeof {DocumentExecution}
       */
      static get Execution() {
        return teriock.executions.abstract.BaseExecution;
      }

      /** @inheritDoc */
      static defineSchema(...args) {
        return Object.assign(super.defineSchema(...args), {
          competence: new fields.EmbeddedDataField(CompetenceModel),
        });
      }

      /**
       * Parse an event into execution data and options for this type.
       * @param {PointerEvent} event
       * @param {AnyCommonDocument} [_source]
       * @returns {Teriock.Execution.ParsedEvent}
       */
      static parseEvent(event, _source) {
        return { data: {}, options: BaseRoll.parseEvent(event) };
      }

      /**
       * An icon that represents using this.
       * @returns {string}
       */
      get useIcon() {
        return TERIOCK.display.icons.ui.dice;
      }

      /**
       * A string that represents using this.
       * @returns {string}
       */
      get useText() {
        return _loc("TERIOCK.MODELS.Usable.USAGE.use");
      }

      /**
       * Use this without any hook or trigger calls.
       * @param {object} [data] - Execution schema data.
       * @param {object} [options] - Execution construction context.
       * @returns {Promise<void>}
       */
      async _use(data = {}, options = {}) {
        options.actor ??= this.actor;
        options.source = this;
        await this.constructor.Execution.create(data, options);
      }

      /** @inheritDoc */
      getLocalRollData() {
        return {
          ...super.getLocalRollData(),
          c: this.competence.bonus,
          flu: Number(this.competence?.fluent),
          pro: Number(this.competence?.proficient),
        };
      }

      /**
       * Uses this, including all hook and trigger calls.
       * @param {Teriock.Command.UseOptions} options
       * @returns {Promise<void>}
       */
      async use(options = {}) {
        options.source ??= this.parent;
        const data = { ...options };
        if (options.event) {
          const parsed = this.constructor.parseEvent(options.event, options.source);
          Object.assign(data, parsed.data);
          Object.assign(options, parsed.options);
        }
        await this._use(data, options);
      }
    }
  );
}
