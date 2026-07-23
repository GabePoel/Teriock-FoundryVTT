import { prefixObject } from "../../../../../../helpers/utils.mjs";
import { TradecraftModel } from "../../../../../models/modifier-models/_module.mjs";

const { EmbeddedDataField, SchemaField } = foundry.data.fields;

/**
 * Actor data model mixin that handles tradecrafts.
 * @param {typeof BaseActorSystem} Base
 */
export default function ActorTradecraftsPart(Base) {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorTradecraftsPartData}
     * @mixin
     */
    class ActorTradecraftsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const tradecrafts = {};
        Object.entries(TERIOCK.reference.tradecrafts).forEach((
          [key, value],
        ) => (tradecrafts[key] = new EmbeddedDataField(TradecraftModel, {
          initial: { bonus: `@tc.${key}.score` },
          label: value,
        })));
        return Object.assign(super.defineSchema(), { tradecrafts: new SchemaField(tradecrafts) });
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        for (const tc of Object.values(this.tradecrafts)) {
          Object.assign(rollData, prefixObject(tc.getLocalRollData(), `tc.${tc.key}`));
        }
        return rollData;
      }

      /**
       * Rolls a tradecraft check.
       *
       * Relevant wiki pages:
       * - [Tradecrafts](https://wiki.teriock.com/index.php/Core:Tradecrafts)
       *
       * @param {Teriock.Keys.Tradecraft} tradecraft - The tradecraft to roll for.
       * @param {Partial<Teriock.Execution.ThresholdExecutionOptions>} [options] - Options for the roll.
       * @returns {Promise<void>}
       */
      async rollTradecraft(tradecraft, options = {}) {
        await this.tradecrafts[tradecraft].use(options);
      }
    }
  );
}
