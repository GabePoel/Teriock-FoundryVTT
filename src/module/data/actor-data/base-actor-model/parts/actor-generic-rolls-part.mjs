import {
  FeatSaveExecution,
  ResistanceExecution,
  TradecraftExecution,
} from "../../../../executions/activity-executions/_module.mjs";
import ImmunityExecution from "../../../../executions/activity-executions/immunity-execution/immunity-execution.mjs";

/**
 * Actor data model mixin that handles common generic rolls.
 * @mixin
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends TeriockBaseActorData
     */
    class ActorGenericRollsPart extends Base {
      /**
       * Rolls a feat save for the specified attribute.
       *
       * Relevant wiki pages:
       * - [Feat Interaction](https://wiki.teriock.com/index.php/Core:Feat_Interaction)
       *
       * @param {Teriock.Parameters.Actor.Attribute} attribute - The attribute to roll a feat save for.
       * @param {Teriock.Execution.FeatSaveExecutionOptions} [options] - Options for the roll.
       */
      async rollFeatSave(attribute, options = { attribute }) {
        const data = {
          attribute,
          options,
        };
        await this.parent.hookCall("rollFeatSave", data);
        if (data.cancel) {
          return;
        }
        attribute = data.attribute;
        options = data.options;
        options.attribute = attribute;
        options.actor = this.parent;
        const execution = new FeatSaveExecution(options);
        await execution.execute();
      }

      /**
       * Rolls an immunity save (these always succeed).
       *
       * Relevant wiki pages:
       * - [Immunity](https://wiki.teriock.com/index.php/Keyword:Immunity)
       *
       * @param {Teriock.Execution.ImmunityExecutionOptions} [options] - Options for the roll.
       * @returns {Promise<void>}
       */
      async rollImmunity(options = {}) {
        const data = { options };
        await this.parent.hookCall("rollImmunity", data);
        if (data.cancel) {
          return;
        }
        options.actor = this.parent;
        const execution = new ImmunityExecution(options);
        await execution.execute();
      }

      /**
       * Rolls a resistance save.
       *
       * Relevant wiki pages:
       * - [Resistance](https://wiki.teriock.com/index.php/Ability:Resist_Effects)
       *
       * @param {Teriock.Execution.ResistanceExecutionOptions} [options] - Options for the roll.
       * @returns {Promise<void>}
       */
      async rollResistance(options = {}) {
        const data = { options };
        await this.parent.hookCall("rollResistance", data);
        if (data.cancel) {
          return;
        }
        options.actor = this.parent;
        const execution = new ResistanceExecution(options);
        await execution.execute();
      }

      /**
       * Rolls a tradecraft check.
       *
       * Relevant wiki pages:
       * - [Tradecrafts](https://wiki.teriock.com/index.php/Core:Tradecrafts)
       *
       * @param {Teriock.Parameters.Fluency.Tradecraft} tradecraft - The tradecraft to roll for.
       * @param {Teriock.Execution.TradecraftExecutionOptions} [options] - Options for the roll.
       * @returns {Promise<void>}
       */
      async rollTradecraft(tradecraft, options = { tradecraft }) {
        const data = {
          tradecraft,
          options,
        };
        await this.parent.hookCall("rollTradecraft", data);
        if (data.cancel) {
          return;
        }
        tradecraft = data.tradecraft;
        options = data.options;
        options.actor = this.parent;
        options.tradecraft = tradecraft;
        const execution = new TradecraftExecution(options);
        await execution.execute();
      }
    }
  );
};
