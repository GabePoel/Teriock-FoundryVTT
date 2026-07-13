import { DeathBagExecution } from "../../../../../../executions/actor-executions/_module.mjs";
import { deathBagSchema } from "../../../../../fields/tools/builders.mjs";

const { fields } = foundry.data;

/**
 * Actor data model mixin that handles the death bag.
 * @param {typeof BaseActorSystem} Base
 */
export default function ActorDeathBagPart(Base) {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorDeathBagPartData}
     * @mixin
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
  );
}
