import StatDieModel from "../shared/stat-die.mjs";

const { fields } = foundry.data;

/**
 * Mixin that provides stat functionality.
 *
 * @param {TeriockBaseItemData} Base
 * @returns {typeof StatData & Base}
 */
export default (Base) => {
  return class StatData extends Base {
    /**
     * Total HP provided by all stat dice.
     *
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
     *
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
     * Render all hit dice as one box HTML element.
     *
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
     *
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
     * Add several stat dice to the end.
     *
     * @param {Teriock.Parameters.Shared.DieStat} stat
     * @param {Teriock.RollOptions.PolyhedralDieFaces} faces
     * @param {number} quantity
     * @returns {Promise<void>}
     */
    async addDice(stat, faces, quantity) {
      const updateData = {};
      for (let i = 0; i < quantity; i++) {
        const id = foundry.utils.randomID();
        updateData[`system.${stat}Dice.${id}`] = {
          _id: id,
          stat: stat,
          faces: faces,
          spent: false,
          value: Math.ceil((faces + 1) / 2),
        };
      }
      await this.parent.update(updateData);
    }

    /**
     * Remove several stat dice from the end.
     *
     * @param {Teriock.Parameters.Shared.DieStat} stat
     * @param {number} quantity
     * @returns {Promise<void>}
     */
    async removeDice(stat, quantity) {
      const updateData = {};
      const keys = Object.keys(this[`${stat}Dice`]);
      for (
        let i = keys.length - 1;
        i >= Math.max(0, keys.length - quantity);
        i--
      ) {
        updateData[`system.${stat}Dice.-=${keys[i]}`] = null;
      }
      await this.parent.update(updateData);
    }

    /**
     * Set the amount of stat dice.
     *
     * @param {Teriock.Parameters.Shared.DieStat} stat
     * @param {Teriock.RollOptions.PolyhedralDieFaces} faces
     * @param {number} quantity
     * @returns {Promise<void>}
     */
    async setDice(stat, faces, quantity) {
      const currentQuantity = Object.keys(this[`${stat}Dice`]).length;
      if (currentQuantity > quantity) {
        await this.removeDice(stat, currentQuantity - quantity);
      } else if (currentQuantity < quantity) {
        await this.addDice(stat, faces, quantity - currentQuantity);
      }
    }

    /**
     * Add a hit die.
     *
     * @param {Teriock.RollOptions.PolyhedralDieFaces} faces
     * @returns {Promise<void>}
     */
    async addHitDie(faces) {
      await this.addDice("hp", faces, 1);
    }

    /**
     * Add a mana die.
     *
     * @param {Teriock.RollOptions.PolyhedralDieFaces} faces
     * @returns {Promise<void>}
     */
    async addManaDie(faces) {
      await this.addDice("mp", faces, 1);
    }
  };
};
