import { setStatDiceDialog } from "../../../applications/dialogs/_module.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { formulaExists } from "../../../helpers/formula.mjs";
import { getImage } from "../../../helpers/path.mjs";
import { getRollIcon } from "../../../helpers/utils.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import EmbeddedDataModel from "../embedded-data-model.mjs";
import StatDieModel from "../stat-die-model/stat-die-model.mjs";

const { fields } = foundry.data;
const { Collection } = foundry.utils;

/**
 * @extends {Teriock.Models.BaseStatPoolModelData}
 * @property {StatGiverSystem} parent
 * @property {Set<number>} spent
 * @implements {Teriock.Functionality.StatProvider}
 */
export default class BaseStatPoolModel extends EmbeddedDataModel {
  /**
   * The model for the stat dice in this pool.
   * @type {typeof StatDieModel}
   */
  static _statDieModel = StatDieModel;

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
   * The stat dice within this pool.
   * @type {StatDieModel[]}
   */
  _dice = [];

  /**
   * The terms that define the stat dice within this pool.
   * @type {DiceTerm[]}
   */
  _terms = [];

  /**
   * @inheritDoc
   * @type {Collection<ID<StatDieModel>, StatDieModel>}
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
   * The path for this stat pool.
   * @returns {string}
   */
  get path() {
    return `system.statDice.${this.stat}`;
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
    this._dice = [];
    this._terms = [];
    if (!this.disabled && formulaExists(this.formula)) {
      const roll = new BaseRoll(this.formula, this.getRollData());
      roll.evaluateSync({ minimize: true });
      this._terms = roll.dice;
      let index = 0;
      for (const term of this._terms) {
        for (let i = 0; i < term.number; i++) {
          const statDie = new this.constructor._statDieModel({
            _id: foundry.utils.randomID(),
            faces: term.faces,
            index,
          }, { parent: this });
          this._dice.push(statDie);
          index++;
        }
      }
    }
    this.dice = new Collection(this._dice.map(d => [d.id, d]));
    this.value = this._dice.reduce((total, die) => ((die.faces + 1) / 2).toNearest(1, "round") + total, 0);
  }

  /**
   * Opens dialog to set stat dice.
   * @returns {Promise<void>}
   */
  async setStatDice() {
    await setStatDiceDialog(this);
  }

  /**
   * Update the stat pool.
   * @param {object} data
   * @returns {Promise<void>}
   */
  async update(data = {}) {
    await this.document.update({ [this.path]: data });
  }
}
