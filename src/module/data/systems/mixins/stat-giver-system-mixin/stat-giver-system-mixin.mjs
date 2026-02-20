import { StatDieModel } from "../../../models/_module.mjs";
import {
  HpPoolModel,
  MpPoolModel,
} from "../../../models/stat-pool-models/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof BaseItemSystem} Base
 */
export default function StatGiverSystemMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseItemSystem}
     * @implements {Teriock.Models.StatGiverSystemInterface}
     * @mixin
     */
    class StatGiverSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.SYSTEMS.StatGiver",
      ];

      /** @inheritDoc */
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, {
          stats: true,
        });
      }

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
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
      }

      /** @inheritDoc */
      getLocalRollData() {
        return {
          ...super.getLocalRollData(),
          "hp.faces": this.statDice.hp.faces,
          "mp.faces": this.statDice.mp.faces,
          "hp.number": this.statDice.hp.number.value,
          "mp.number": this.statDice.mp.number.value,
          "hp.disabled": Number(this.statDice.hp.disabled),
          "mp.disabled": Number(this.statDice.mp.disabled),
          hp: this.statDice.hp.formula,
          mp: this.statDice.mp.formula,
        };
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
        for (const pool of Object.values(this.statDice)) {
          pool.number.evaluate();
          if (pool.dice.length < pool.number.value || 0) {
            for (let i = pool.dice.length; i < pool.number.value; i++) {
              pool.dice.push(new StatDieModel({}, { parent: pool }));
            }
          }
          for (const [i, die] of Object.entries(pool.dice)) {
            die.index = Number(i);
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
