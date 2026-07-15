import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { formulaExists } from "../../../helpers/formula.mjs";
import { getRollIcon } from "../../../helpers/icon.mjs";
import { getImage } from "../../../helpers/path.mjs";
import { toId } from "../../../helpers/string.mjs";
import { BaseDataModel } from "../../abstract/_module.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { StatDie } from "../../pseudo-documents/_module.mjs";

const { fields } = foundry.data;
const { Collection } = foundry.utils;

/**
 * @extends {Teriock.Models.BaseStatPoolModelData}
 * @property {StatGiverSystem} parent
 * @property {Set<number>} spent
 * @implements {Teriock.Functionality.StatProvider}
 */
export default class BaseStatPoolModel extends BaseDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.BaseStatPool"];

  /** @inheritDoc */
  static defineSchema() {
    return {
      disabled: new fields.BooleanField({ initial: false }),
      formula: new FormulaField({ deterministic: false, initial: "1d10" }),
      spent: new fields.SetField(new fields.NumberField()),
    };
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    if (foundry.utils.hasProperty(source, "faces") && !foundry.utils.hasProperty(source, "formula")) {
      let number = source.number.raw || "1";
      if (!Number.isNumeric(Number(number))) { number = `(${number})`; }
      source.formula = `${number}d${source.faces}`;
      delete source.faces;
      delete source.number;
    }
    return super.migrateData(source, options, state);
  }

  /**
   * A collection of all the dice within this pool.
   * @type {Collection<ID<StatDie>, StatDie>}
   */
  dice;

  /**
   * Total stat value of all the dice in this pool.
   * @type {number}
   */
  value = 0;

  /**
   * @returns {(_number: number) => Promise<void>}
   * @abstract
   */
  get callback() {
    return _number => {};
  }

  /**
   * Name for a die in this pool.
   * @returns {string}
   */
  get dieName() {
    return _loc("TERIOCK.MODELS.BaseStatPool.PANELS.name");
  }

  /**
   * Flavor to apply to stat dice.
   * @returns {string}
   */
  get flavor() {
    return "";
  }

  /**
   * @returns {Teriock.Panels.PanelParts[]}
   */
  get panels() {
    return [{
      bars: [],
      blocks: [{
        text: _loc("TERIOCK.MODELS.BaseStatPool.PANELS.text"),
        title: _loc("TERIOCK.MODELS.BaseStatPool.PANELS.title"),
      }],
      icon: getRollIcon(this.formula),
      image: getImage("equipment", "Die"),
      name: _loc("TERIOCK.MODELS.BaseStatPool.PANELS.name"),
    }];
  }

  /**
   * The stat this modifies.
   * @returns {string}
   */
  get stat() {
    return "";
  }

  /** @inheritDoc */
  prepareStatDice() {
    const dice = [];
    if (!this.disabled && formulaExists(this.formula)) {
      const roll = new BaseRoll(this.formula, this.getRollData());
      roll.evaluateSync({ minimize: true });
      const terms = roll.dice;
      let index = 0;
      for (const term of terms) {
        for (let i = 0; i < term.number; i++) {
          const statDie = new StatDie({
            _id: toId(this.parent.parent.collectionName + this.parent.parent.id + this.path + index.toString(), {
              hash: true,
            }),
            faces: term.faces,
            index,
          }, { parent: this });
          dice.push(statDie);
          index++;
        }
      }
    }
    this.dice = new Collection(dice.map(d => [d.id, d]));
    this.value = dice.reduce((total, die) => ((die.faces + 1) / 2).toNearest(1, "round") + total, 0);
  }
}
