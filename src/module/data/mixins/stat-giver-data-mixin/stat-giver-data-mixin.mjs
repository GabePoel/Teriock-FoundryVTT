import { StatDieModel } from "../../models/_module.mjs";
import {
  HpPoolModel,
  MpPoolModel,
} from "../../models/stat-pool-models/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof TeriockBaseItemModel} Base
 * @constructor
 */
export default function StatGiverDataMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {StatGiverMixinInterface}
     * @extends {TeriockBaseItemModel}
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
        const schema = super.defineSchema();
        Object.assign(schema, {
          statDice: new fields.SchemaField({
            hp: new fields.EmbeddedDataField(HpPoolModel, {
              label: "HP Dice",
              nullable: false,
            }),
            mp: new fields.EmbeddedDataField(MpPoolModel, {
              label: "MP Dice",
              nullable: false,
            }),
          }),
        });
        return schema;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        for (const pool of Object.values(this.statDice)) {
          pool.number.evaluate();
        }
      }

      /** @inheritDoc */
      prepareSpecialData() {
        for (const [stat, pool] of Object.entries(this.statDice)) {
          pool.number.evaluate();
          pool.stat = stat;
          if (pool.dice.length < pool.number.value || 0) {
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
            die.flavor = pool.flavor;
            if (!die.rolled || die.value > die.faces) {
              die.value = Math.ceil(die.faces / 2) + 1;
            }
            if (die.index >= (pool.number?.value || 0) || pool.disabled) {
              die.disabled = true;
            }
          }
        }
      }
    }
  );
}
