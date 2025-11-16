import { StatDieModel } from "../../models/_module.mjs";
import {
  HpPoolModel,
  MpPoolModel,
} from "../../models/stat-pool-models/_module.mjs";
import {
  deriveModifiableDeterministic,
  prepareModifiableBase,
} from "../../shared/fields/modifiable.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof ChildTypeModel} Base
 * @constructor
 */
export default function StatGiverDataMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {StatGiverMixinInterface}
     * @mixin
     */
    class StatGiverData extends Base {
      /** @inheritDoc */
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, {
          stats: true,
        });
      }

      /** @inheritDoc */
      static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
          statDice: new fields.SchemaField({
            hp: new fields.EmbeddedDataField(HpPoolModel),
            mp: new fields.EmbeddedDataField(MpPoolModel),
          }),
        });
      }

      /** @inheritDoc */
      prepareBaseData() {
        for (const pool of Object.values(this.statDice)) {
          prepareModifiableBase(pool.number);
        }
      }

      /** @inheritDoc */
      prepareSpecialData() {
        for (const [stat, pool] of Object.entries(this.statDice)) {
          deriveModifiableDeterministic(pool.number, this.parent, {
            floor: true,
            min: 0,
            blank: 1,
          });
          pool.stat = stat;
          if (pool.dice.length < pool.number.value) {
            for (let i = pool.dice.length; i < pool.number.value; i++) {
              pool.dice.push(
                new StatDieModel(
                  {},
                  {
                    parent: pool,
                  },
                ),
              );
            }
          }
          for (const [i, die] of Object.entries(pool.dice)) {
            die.stat = stat;
            die.index = Number(i);
            die.faces = pool.faces;
            if (!die.rolled || die.value > die.faces) {
              die.value = Math.ceil(die.faces / 2) + 1;
            }
            if (die.index >= pool.number.value || pool.disabled) {
              die.disabled = true;
            }
          }
        }
      }
    }
  );
}
