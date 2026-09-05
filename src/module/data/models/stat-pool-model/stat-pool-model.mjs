import impactConfig from "../../../constants/config/impact-config.mjs";
import statConfig from "../../../constants/config/stat-config.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { formulaExists } from "../../../helpers/formula.mjs";
import { toId } from "../../../helpers/string.mjs";
import { BaseDataModel } from "../../abstract/_module.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { StatDie } from "../../pseudo-documents/_module.mjs";

const { fields } = foundry.data;
const { Collection } = foundry.utils;

/**
 * @property {StatGiverSystem} parent
 * @implements {Teriock.Functionality.StatProvider}
 */
export default class StatPoolModel extends BaseDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.BaseStatPool"];

  /** @inheritDoc */
  static defineSchema() {
    return {
      disabled: new fields.BooleanField({ initial: false }),
      formula: new FormulaField({
        blank: true,
        deterministic: false,
        nullable: false,
        placeholder: _loc("COMMON.None"),
        required: true,
      }),
      spent: new fields.SetField(new fields.NumberField()),
    };
  }

  /**
   * Config entry for this pool's stat.
   * @returns {Teriock.Config.StatEntry}
   */
  get #config() {
    return statConfig[this.stat];
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
   * @returns {(amount: number) => Promise<void>}
   */
  get callback() {
    const reverse = impactConfig[this.#config?.impact]?.reverse;
    return async amount => {
      await reverse?.(this.actor, amount);
      if (this.stat === "hp" && !this.actor?.statuses.has("criticallyWounded")) {
        await this.actor?.system.takeAwaken();
      }
    };
  }

  /**
   * Name for a die in this pool.
   * @returns {string}
   */
  get dieName() {
    return _loc(this.#config.pool.panel.name);
  }

  /**
   * Flavor to apply to stat dice.
   * @returns {string}
   */
  get flavor() {
    return this.stat;
  }

  /**
   * Whether this has dice.
   * @return {boolean}
   */
  get hasDice() {
    return formulaExists(this.formula);
  }

  /**
   * Icon for this pool's current enabled/disabled state.
   * @returns {string}
   */
  get icon() {
    return this.disabled ? this.#config.pool.icons.disabled : this.#config.pool.icons.enabled;
  }

  /**
   * @returns {Teriock.Panels.PanelParts[]}
   */
  get panels() {
    const panels = [{
      bars: [],
      blocks: [{ text: _loc(this.#config.pool.panel.text), title: _loc("TERIOCK.MODELS.BaseStatPool.PANELS.title") }],
      icon: this.#config.icon,
      img: this.#config.pool.img,
      name: this.dieName,
    }];
    if (this.stat === "hp" && this.actor?.statuses.has("criticallyWounded")) {
      panels.push({
        bars: [],
        blocks: [{
          text: TERIOCK.statuses.conditions.criticallyWounded.description,
          title: _loc("TERIOCK.MODELS.BaseStatPool.PANELS.title"),
        }],
        icon: TERIOCK.config.document.condition.icon,
        img: TERIOCK.statuses.conditions.criticallyWounded.img,
        name: TERIOCK.statuses.conditions.criticallyWounded.name,
      });
    } else if (this.stat === "hp" && this.actor?.statuses.has("unconscious")) {
      panels.push({
        bars: [],
        blocks: [{ text: TERIOCK.content.keywords.awaken, title: _loc("TERIOCK.MODELS.BaseStatPool.PANELS.title") }],
        icon: TERIOCK.display.icons.manifest.effect.awaken,
        img: TERIOCK.display.images.manifest.effectTypes.awakening,
        name: _loc("TERIOCK.EFFECTS.Common.awaken"),
      });
    }
    return panels;
  }

  /**
   * The stat this corresponds to.
   * @return {Teriock.Keys.DieStat}
   */
  get stat() {
    return this.schema.name;
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
