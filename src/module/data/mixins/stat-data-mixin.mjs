import { TeriockRoll } from "../../documents/_module.mjs";
import StatDieModel from "../shared/stat-die-model.mjs";

const { fields } = foundry.data;

/**
 * Mixin that provides stat functionality.
 * @param {typeof ChildDataModel} Base
 */
export default (Base) => {
  return class StatDataMixin extends Base {
    /** @inheritDoc */
    static defineSchema() {
      const schema = super.defineSchema();
      Object.assign(schema, {
        hpDice: this.defineStatDieField("hp"),
        mpDice: this.defineStatDieField("mp"),
      });
      return schema;
    }

    /**
     * @param {Teriock.Parameters.Shared.DieStat} stat
     * @param {object} [options]
     * @param {Teriock.RollOptions.PolyhedralDieFaces} [options.faces]
     * @param {number} [options.value]
     */
    static defineStatDieField(stat, options = {}) {
      const id = foundry.utils.randomID();
      const { faces = 8, value = 5 } = options;
      return new fields.TypedObjectField(
        new fields.EmbeddedDataField(StatDieModel),
        {
          initial: {
            [id]: {
              _id: id,
              stat: stat,
              faces: faces,
              spent: false,
              value: value,
            },
          },
        },
      );
    }

    /**
     * Render all hit dice as one box HTML element.
     * @returns {string}
     */
    get renderedHitDice() {
      let out = "";
      Object.values(this.hpDice).forEach((die) => {
        out += die.rendered;
      });
      return out;
    }

    /**
     * Render all mana dice as one box HTML element.
     * @returns {string}
     */
    get renderedManaDice() {
      let out = "";
      Object.values(this.mpDice).forEach((die) => {
        out += die.rendered;
      });
      return out;
    }

    /**
     * Total HP provided by all stat dice.
     * @returns {number}
     */
    get totalHp() {
      let total = 0;
      Object.values(this.hpDice).forEach((hpDie) => {
        total += hpDie.value;
      });
      return total;
    }

    /**
     * Total MP provided by all stat dice.
     * @returns {number}
     */
    get totalMp() {
      let total = 0;
      Object.values(this.mpDice).forEach((mpDie) => {
        total += mpDie.value;
      });
      return total;
    }

    /**
     * Set the stat dice.
     * @param {Teriock.Parameters.Shared.DieStat} stat
     * @param {number} number
     * @param {Teriock.RollOptions.PolyhedralDieFaces} faces
     * @returns {Promise<void>}
     */
    async setDice(stat, number, faces) {
      const currentQuantity = Object.keys(this[`${stat}Dice`]).length;
      const keys = Object.keys(this[`${stat}Dice`]);
      const updateData = {};
      for (let i = 0; i < Math.max(number, currentQuantity); i++) {
        if (i < currentQuantity && i < number) {
          updateData[`system.${stat}Dice.${keys[i]}.faces`] = faces;
          updateData[`system.${stat}Dice.${keys[i]}.value`] = Math.ceil(
            (faces + 1) / 2,
          );
        } else if (i < currentQuantity && i >= number) {
          updateData[`system.${stat}Dice.-=${keys[i]}`] = null;
        } else if (i >= currentQuantity && i < number) {
          const id = foundry.utils.randomID();
          updateData[`system.${stat}Dice.${id}`] = {
            _id: id,
            stat: stat,
            faces: faces,
            spent: false,
            value: Math.ceil((faces + 1) / 2),
          };
        }
      }
      await this.parent.update(updateData);
    }

    /**
     * Set the stat dice from a formula.
     * @param {Teriock.Parameters.Shared.DieStat} stat
     * @param {string} formula
     * @returns {Promise<void>}
     */
    async setDiceFormula(stat, formula) {
      const roll = new TeriockRoll(formula);
      if (roll.dice.length === 0) return;
      const die = roll.dice[0];
      await this.setDice(stat, die.number, die.faces);
    }
  };
};
