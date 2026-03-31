import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { CompetenceModel } from "../../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * Mixin for data models that can be used. This typically involves running an execution.
 * @param {typeof EmbeddedDataModel | typeof CommonSystem} Base
 */
export default function UsableDataMixin(Base) {
  return (
    /**
     * @extends {EmbeddedDataModel|CommonSystem}
     * @extends {Teriock.Models.UsableDataData}
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
       * @param {PointerEvent} event
       * @returns {Teriock.Execution.DocumentExecutionOptions}
       */
      static parseEvent(event) {
        return BaseRoll.parseEvent(event);
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
        return game.i18n.localize("TERIOCK.MODELS.Usable.USAGE.use");
      }

      /**
       * Use this without any hook or trigger calls.
       * @param {object} _options
       * @returns {Promise<void>}
       */
      async _use(_options = {}) {}

      /** @inheritDoc */
      getLocalRollData() {
        return {
          ...super.getLocalRollData(),
          flu: Number(this.competence?.fluent),
          pro: Number(this.competence?.proficient),
        };
      }

      /**
       * Uses this, including all hook and trigger calls.
       * @param {Teriock.Interaction.UseOptions} options
       * @returns {Promise<void>}
       */
      async use(options = {}) {
        options.source ??= this.parent;
        if (options.event) {
          Object.assign(options, this.constructor.parseEvent(options.event));
        }
        await this._use(options);
      }
    }
  );
}
