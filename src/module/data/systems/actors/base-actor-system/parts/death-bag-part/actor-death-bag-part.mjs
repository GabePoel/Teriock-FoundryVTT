import { DeathBagExecution } from "../../../../../../executions/actor-executions/_module.mjs";
import { deathBagSchema } from "../../../../../fields/tools/builders.mjs";

const { fields } = foundry.data;

/**
 * Actor data model mixin that handles the death bag.
 *
 * Relevant wiki pages:
 * - [Death Bag](https://wiki.teriock.com/index.php/Core:Death_Bag)
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ActorDeathBagPart & Teriock.Models.ActorDeathBagPartData>}
 */
export default function ActorDeathBagPart(Base) {
  /**
   * @implements {Teriock.Models.ActorDeathBagPartData}
   * @mixin
   * @property {TeriockActor} parent
   */
  class ActorDeathBagPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { deathBag: new fields.SchemaField(deathBagSchema()) });
    }

    /**
     * Pull from the Death Bag.
     * @param {Partial<Teriock.Execution.ExecutionOptions>} [options]
     * @returns {Promise<void>}
     */
    async deathBagPull(options = {}) {
      await DeathBagExecution.create({}, Object.assign(options, { source: this.parent }));
    }

    /** @inheritDoc */
    getRollData() {
      const rollData = super.getRollData();
      rollData["db.pull"] = this.deathBag.pull;
      for (const color of Object.keys(this.deathBag.stones)) {
        rollData[`db.stones.${color}`] = this.deathBag.stones[color];
      }
      return rollData;
    }
  }

  return ActorDeathBagPart;
}
