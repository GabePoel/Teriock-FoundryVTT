import { protectionOptions } from "../../../../../../constants/options/protection-options.mjs";
import { ThresholdRoll } from "../../../../../../dice/rolls/_module.mjs";
import {
  ImmunityExecution,
  ResistanceExecution,
} from "../../../../../../executions/activity-executions/_module.mjs";
import { objectMap } from "../../../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles protections.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseActorSystem}
     * @implements {ActorProtectionsPartInterface}
     * @mixin
     */
    class ActorProtectionsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          protections: new fields.SchemaField(
            objectMap(
              protectionOptions.types,
              (type) =>
                new fields.SchemaField(
                  objectMap(
                    protectionOptions.categories,
                    (category) =>
                      new fields.SetField(new fields.StringField(), {
                        label: category.label,
                      }),
                  ),
                  { label: type.label },
                ),
            ),
          ),
        });
      }

      /**
       * Checks if there's some protection against something
       *
       * Relevant wiki pages:
       * - [Protection keywords](https://wiki.teriock.com/index.php/Category:Protection_keywords)
       *
       * @param {ProtectionCategoryKey} category - Category of protection
       * @param {string} value - Specific protection
       * @returns {boolean} Whether or not there's some protection against the specified key and value
       */
      isProtected(category, value) {
        let hasProtection = false;
        for (const protectionData of Object.values(this.protections)) {
          if ((protectionData[category] || new Set()).has(value)) {
            hasProtection = true;
          }
        }
        return hasProtection;
      }

      /**
       * Rolls an immunity save (these always succeed).
       *
       * Relevant wiki pages:
       * - [Immunity](https://wiki.teriock.com/index.php/Keyword:Immunity)
       * - [Hexseal](https://wiki.teriock.com/index.php/Keyword:Hexseal)
       *
       * @param {Teriock.Execution.ImmunityExecutionOptions} [options] - Options for the roll.
       * @returns {Promise<void>}
       */
      async rollImmunity(options = {}) {
        const data = { options };
        await this.parent.hookCall("rollImmunity", data);
        if (data.cancel) return;
        options.actor = this.parent;
        const execution = new ImmunityExecution(options);
        await execution.execute();
      }

      /**
       * Rolls a resistance save.
       *
       * Relevant wiki pages:
       * - [Resistance](https://wiki.teriock.com/index.php/Ability:Resist_Effects)
       * - [Hexproof](https://wiki.teriock.com/index.php/Keyword:Hexproof)
       *
       * @param {Teriock.Execution.ResistanceExecutionOptions} [options] - Options for the roll.
       * @returns {Promise<void>}
       */
      async rollResistance(options = {}) {
        if (options.event) {
          Object.assign(options, ThresholdRoll.parseEvent(options.event));
        }
        const data = { options };
        await this.parent.hookCall("rollResistance", data);
        if (data.cancel) return;
        options.actor = this.parent;
        const execution = new ResistanceExecution(options);
        await execution.execute();
      }
    }
  );
};
