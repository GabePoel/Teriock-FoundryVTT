import { DeathBagExecution } from "../../../../../../executions/actor-executions/_module.mjs";
import { FormulaField } from "../../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Actor data model mixin that handles the death bag.
 * @param {typeof BaseActorSystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorDeathBagPartData}
     * @mixin
     */
    class ActorDeathBagPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          deathBag: new fields.SchemaField({
            pull: new FormulaField({ deterministic: false, initial: "10", nullable: false }),
            stones: new fields.SchemaField({
              black: stoneField("black", 3),
              red: stoneField("red", 10),
              white: stoneField("white", 20),
            }),
          }),
        });
      }

      /**
       * Pull from the Death Bag.
       * @param {Partial<Teriock.Execution.DeathBagExecutionOptions>} [options]
       * @returns {Promise<void>}
       */
      async deathBagPull(options = {}) {
        await DeathBagExecution.create(Object.assign(options, { actor: this.parent }));
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        Object.assign(rollData, {
          "db.pull": this.deathBag.pull,
          "db.stones.black": this.deathBag.stones.black,
          "db.stones.red": this.deathBag.stones.red,
          "db.stones.white": this.deathBag.stones.white,
        });
        return rollData;
      }
    }
  );
};

/**
 * Make the field for a color of stone in the Death Bag.
 * @param {Teriock.Keys.DeathBagStoneColor} color
 * @param {number} initial
 * @returns {FormulaField}
 */
function stoneField(color, initial) {
  return new FormulaField({
    deterministic: false,
    initial: `${initial}`,
    label: _loc(`TERIOCK.TERMS.Stones.${color}`),
    nullable: false,
  });
}
