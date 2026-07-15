import impactConfig from "../../../constants/config/impact-config.mjs";
import statConfig from "../../../constants/config/stat-config.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { formulaExists } from "../../../helpers/formula.mjs";
import { getImage } from "../../../helpers/path.mjs";
import { toId } from "../../../helpers/string.mjs";
import { BaseDataModel } from "../../abstract/_module.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { StatDie } from "../../pseudo-documents/_module.mjs";

const { fields } = foundry.data;
const { Collection } = foundry.utils;

const POOL_STATS = Object.keys(statConfig).filter(k => statConfig[k].pool?.enabled);

/**
 * @extends {Teriock.Models.StatPoolModelData}
 * @property {StatGiverSystem} parent
 * @property {Set<number>} spent
 * @implements {Teriock.Functionality.StatProvider}
 */
export default class StatPoolModel extends BaseDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.BaseStatPool"];

  /** @inheritDoc */
  static defineSchema() {
    return {
      disabled: new fields.BooleanField({ initial: false }),
      formula: new FormulaField({ deterministic: false, initial: "1d10" }),
      spent: new fields.SetField(new fields.NumberField()),
      stat: new fields.StringField({ choices: POOL_STATS, nullable: false, required: true }),
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
    if (!source.stat && state?.parentPath) {
      const match = state.parentPath.match(/\.statDice\.(\w+)$/);
      if (match) { source.stat = match[1]; }
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
   * @returns {(amount: number) => Promise<void>}
   */
  get callback() {
    const reverse = impactConfig[this.config?.impact]?.reverse;
    return async amount => {
      await reverse?.(this.actor, amount);
      if (this.stat === "hp" && !this.actor?.statuses.has("criticallyWounded")) {
        await this.actor?.system.takeAwaken();
      }
    };
  }

  /**
   * Config entry for this pool's stat.
   * @returns {Teriock.Config.StatEntry}
   */
  get config() {
    return statConfig[this.stat];
  }

  /**
   * Name for a die in this pool.
   * @returns {string}
   */
  get dieName() {
    return _loc(this.config.pool.panel.name);
  }

  /**
   * Flavor to apply to stat dice.
   * @returns {string}
   */
  get flavor() {
    return this.stat;
  }

  /**
   * @returns {Teriock.Panels.PanelParts[]}
   */
  get panels() {
    const panels = [{
      bars: [],
      blocks: [{ text: _loc(this.config.pool.panel.text), title: _loc("TERIOCK.MODELS.BaseStatPool.PANELS.title") }],
      icon: this.config.icon,
      image: getImage("misc", this.config.pool.img),
      name: this.dieName,
    }];
    if (this.stat === "hp" && this.actor?.statuses.has("criticallyWounded")) {
      panels.push({
        bars: [],
        blocks: [{
          text: TERIOCK.data.conditions.criticallyWounded.description,
          title: _loc("TERIOCK.MODELS.BaseStatPool.PANELS.title"),
        }],
        icon: TERIOCK.config.document.condition.icon,
        image: TERIOCK.data.conditions.criticallyWounded.img,
        name: TERIOCK.data.conditions.criticallyWounded.name,
      });
    } else if (this.stat === "hp" && this.actor?.statuses.has("unconscious")) {
      panels.push({
        bars: [],
        blocks: [{ text: TERIOCK.content.keywords.awaken, title: _loc("TERIOCK.MODELS.BaseStatPool.PANELS.title") }],
        icon: TERIOCK.display.icons.effect.awaken,
        image: getImage("effect-types", "Awakening"),
        name: _loc("TERIOCK.EFFECTS.Common.awaken"),
      });
    }
    return panels;
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
