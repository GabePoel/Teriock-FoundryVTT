import { deathBagDialog } from "../../../../../../applications/dialogs/_module.mjs";
import { FormulaField } from "../../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Actor data model mixin that handles the death bag.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseActorSystem}
     * @implements {ActorDeathBagPartInterface}
     * @mixin
     */
    class ActorDeathBagPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          deathBag: new fields.SchemaField({
            pull: new FormulaField({
              initial: "10",
              nullable: false,
              deterministic: false,
            }),
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
       * @returns {Promise<void>}
       */
      async deathBagPull() {
        const data = await this.parent.hookCall("deathBagPull");
        if (data.cancel) return;
        await deathBagDialog(this.actor);
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        Object.assign(rollData, {
          "db.stones.black": this.deathBag.stones.black,
          "db.stones.red": this.deathBag.stones.red,
          "db.stones.white": this.deathBag.stones.white,
          "db.pull": this.deathBag.pull,
        });
        return rollData;
      }
    }
  );
};

/**
 * Make the field for a color of stone in the Death Bag.
 * @param {Teriock.Parameters.Actor.DeathBagStoneColor} color
 * @param {number} initial
 * @returns {FormulaField}
 */
function stoneField(color, initial) {
  return new FormulaField({
    initial: `${initial}`,
    nullable: false,
    deterministic: false,
    label: game.i18n.localize(`TERIOCK.TERMS.Stones.${color}`),
  });
}
