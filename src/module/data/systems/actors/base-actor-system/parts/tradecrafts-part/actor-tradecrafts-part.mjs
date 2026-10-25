import { prefixObject } from "../../../../../../utils/_module.mjs";
import { TradecraftModel } from "../../../../../models/modifier-models/_module.mjs";

/**
 * @import { TradecraftExecutionMixin } from "../../../../../../executions/mixins/tradecraft-execution-mixin.mjs";
 * @import AbstractActorSystem from "../../abstract-actor-system.mjs";
 */

const { EmbeddedDataField, SchemaField } = foundry.data.fields;
/**
 * Actor data model mixin that handles tradecrafts.
 *
 * Relevant wiki pages:
 * - [Tradecrafts](https://wiki.teriock.com/index.php/Core:Tradecrafts)
 *
 * @template {MixinBase<typeof AbstractActorSystem>} T
 * @param {T} Base
 * @see {TradecraftModel}
 * @see {TradecraftExecutionMixin}
 */
export default function ActorTradecraftsPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.ActorTradecraftsPartData}
   * @property {TeriockActor} parent
   */
  class ActorTradecraftsPart
    extends /** @type {InitializedDataModel<T, Teriock.Models.ActorTradecraftsPartData>} */ (Base)
  {
    /** @inheritDoc */
    static defineSchema() {
      const tradecrafts = {};
      Object.entries(TERIOCK.CONFIG.tradecraft.tradecrafts).forEach((
        [key, value],
      ) => (tradecrafts[key] = new EmbeddedDataField(TradecraftModel, {
        initial: { competence: { raw: 0 }, score: 0 },
        label: value.label,
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
  }

  return ActorTradecraftsPart;
}
