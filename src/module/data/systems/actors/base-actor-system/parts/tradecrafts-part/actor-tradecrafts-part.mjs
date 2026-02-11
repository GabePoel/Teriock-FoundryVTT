import { prefixObject } from "../../../../../../helpers/utils.mjs";
import { EvaluationField } from "../../../../../fields/_module.mjs";
import { TradecraftModel } from "../../../../../models/_module.mjs";

const { SchemaField } = foundry.data.fields;

/**
 * Actor data model mixin that handles tradecrafts.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseActorSystem}
     * @implements {ActorTradecraftsPartInterface}
     * @mixin
     */
    class ActorTradecraftsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const tradecrafts = {};
        Object.entries(TERIOCK.index.tradecrafts).forEach(
          ([key, value]) =>
            (tradecrafts[key] = new EvaluationField({
              deterministic: false,
              initial: `@tc.${key}.score`,
              label: value,
              model: TradecraftModel,
            })),
        );
        return Object.assign(super.defineSchema(), {
          tradecrafts: new SchemaField(tradecrafts),
        });
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        for (const tc of Object.values(this.tradecrafts)) {
          Object.assign(
            rollData,
            prefixObject(tc.getLocalRollData(), `tc.${tc.key}`),
          );
        }
        return rollData;
      }

      /**
       * Rolls a tradecraft check.
       *
       * Relevant wiki pages:
       * - [Tradecrafts](https://wiki.teriock.com/index.php/Core:Tradecrafts)
       *
       * @param {Teriock.Parameters.Fluency.Tradecraft} tradecraft - The tradecraft to roll for.
       * @param {Partial<Teriock.Execution.TradecraftExecutionOptions>} [options] - Options for the roll.
       * @returns {Promise<void>}
       */
      async rollTradecraft(tradecraft, options = { tradecraft }) {
        await this.tradecrafts[tradecraft].use(options);
      }
    }
  );
};
