import { dieOptions } from "../../../constants/die-options.mjs";
import { mergeFreeze } from "../../../helpers/utils.mjs";
import StatDieModel from "../../models/stat-die-model/stat-die-model.mjs";

const { fields } = foundry.data;

/**
 * Mixin that provides stat functionality.
 * @param {typeof ChildTypeModel} Base
 */
export default (Base) => {
  // noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {StatDataMixinInterface}
     * @extends ChildTypeModel
     */
    class StatDataMixin extends Base {
      /** @inheritDoc */
      static metadata = mergeFreeze(super.metadata, {
        stats: true,
      });

      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          hpDice: this.defineStatDieField("hp"),
          mpDice: this.defineStatDieField("mp"),
          hpDiceBase: this.defineStatDieBaseField(),
          mpDiceBase: this.defineStatDieBaseField(),
          applyHp: new fields.BooleanField({
            hint: "Add HP to the parent actor.",
            initial: true,
            label: "Apply HP",
          }),
          applyMp: new fields.BooleanField({
            hint: "Add MP to the parent actor.",
            initial: true,
            label: "Apply MP",
          }),
        });
        return schema;
      }

      /**
       * @param {object} [options]
       * @param {Teriock.RollOptions.PolyhedralDieFaces} [options.faces]
       * @param {number} [options.number]
       * @returns {fields.SchemaField}
       */
      static defineStatDieBaseField(options = {}) {
        const { faces = 8, number = 1 } = options;
        return new fields.SchemaField({
          faces: new fields.NumberField({ initial: faces }),
          number: new fields.NumberField({ initial: number }),
        });
      }

      /**
       * @param {Teriock.Parameters.Shared.DieStat} stat
       * @param {object} [options]
       * @param {Teriock.RollOptions.PolyhedralDieFaces} [options.faces]
       * @param {number} [options.value]
       * @returns {fields.TypedObjectField}
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
      get hpDiceBaseFormula() {
        return `${this.hpDiceBase.number}d${this.hpDiceBase.faces}`;
      }

      /** @inheritDoc */
      get hpDiceFaces() {
        return Object.values(this.hpDice)[0].faces;
      }

      /** @inheritDoc */
      get hpDiceFormula() {
        return `${this.hpDiceNumber}d${this.hpDiceFaces}`;
      }

      /** @inheritDoc */
      get hpDiceNumber() {
        return Object.keys(this.hpDice).length;
      }

      /** @inheritDoc */
      get mpDiceBaseFormula() {
        return `${this.mpDiceBase.number}d${this.mpDiceBase.faces}`;
      }

      /** @inheritDoc */
      get mpDiceFaces() {
        return Object.values(this.mpDice)[0].faces;
      }

      /** @inheritDoc */
      get mpDiceFormula() {
        return `${this.mpDiceNumber}d${this.mpDiceFaces}`;
      }

      /** @inheritDoc */
      get mpDiceNumber() {
        return Object.keys(this.mpDice).length;
      }

      /** @inheritDoc */
      get renderedHitDice() {
        let out = "";
        Object.values(this.hpDice).forEach((die) => {
          out += die.rendered;
        });
        return out;
      }

      /** @inheritDoc */
      get renderedManaDice() {
        let out = "";
        Object.values(this.mpDice).forEach((die) => {
          out += die.rendered;
        });
        return out;
      }

      /** @inheritDoc */
      get totalHp() {
        let total = 0;
        Object.values(this.hpDice).forEach((hpDie) => {
          total += hpDie.value;
        });
        return total;
      }

      /** @inheritDoc */
      get totalMp() {
        let total = 0;
        Object.values(this.mpDice).forEach((mpDie) => {
          total += mpDie.value;
        });
        return total;
      }

      /** @inheritDoc */
      async _preUpdate(changes, options, user) {
        await super._preUpdate(changes, options, user);
        for (const stat of Object.keys(dieOptions.stats)) {
          if (foundry.utils.getProperty(changes, `system.${stat}DiceBase`)) {
            const number =
              foundry.utils.getProperty(
                changes,
                `system.${stat}DiceBase.number`,
              ) || this[`${stat}DiceBase`].number;
            const faces =
              foundry.utils.getProperty(
                changes,
                `system.${stat}DiceBase.faces`,
              ) || this[`${stat}DiceBase`].faces;
            this._setDice(stat, number, faces);
          }
        }
      }

      /** @inheritDoc */
      _setDice(stat, number, faces) {
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
        this.parent.updateSource(updateData);
      }

      // /**
      //  * Set the stat dice from a formula.
      //  * @param {Teriock.Parameters.Shared.DieStat} stat
      //  * @param {string} formula
      //  */
      // _setDiceFormula(stat, formula) {
      //   const roll = new TeriockRoll(formula);
      //   if (roll.dice.length === 0) return;
      //   const die = roll.dice[0];
      //   this._setDice(stat, die.number, die.faces);
      // }
    }
  );
};
