import { setStatDiceDialog } from "../../../applications/dialogs/_module.mjs";
import { getImage } from "../../../helpers/path.mjs";
import { getRollIcon } from "../../../helpers/utils.mjs";
import { EvaluationField } from "../../fields/_module.mjs";
import EmbeddedDataModel from "../embedded-data-model.mjs";
import StatDieModel from "../stat-die-model/stat-die-model.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * @implements {Teriock.Models.StatPoolModelInterface}
 */
export default class StatPoolModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.MODELS.StatPool",
  ];

  /** @inheritDoc */
  static defineSchema() {
    return {
      disabled: new fields.BooleanField({
        initial: false,
        required: false,
      }),
      faces: new fields.NumberField({
        initial: 10,
        required: false,
        choices: TERIOCK.options.die.faces,
      }),
      number: new EvaluationField({
        blank: 1,
        deterministic: true,
        floor: true,
        initial: "1",
        min: 0,
        nullable: false,
        required: false,
      }),
      dice: new fields.ArrayField(new fields.EmbeddedDataField(StatDieModel)),
    };
  }

  /**
   * @returns {(_number: number) => Promise<void>}
   * @abstract
   */
  get callback() {
    return (_number) => {};
  }

  /**
   * Name for a die in this pool.
   * @returns {string}
   */
  get dieName() {
    return game.i18n.localize("TERIOCK.MODELS.StatPool.PANELS.name");
  }

  /**
   * The dice that are not disabled.
   * @returns {StatDieModel[]}
   */
  get enabledDice() {
    return this.dice.filter((d) => !d.disabled);
  }

  /**
   * Flavor to apply to stat dice.
   * @returns {string}
   */
  get flavor() {
    return "";
  }

  /**
   * Formula that describes the dice in this pool.
   * @returns {string}
   */
  get formula() {
    return `${this.number.value || 0}d${this.faces}`;
  }

  /**
   * Render a die box HTML element. Creates a clickable pool of dic icon that shows whether each die has been used or
   * not.
   * @returns {string}
   */
  get html() {
    let html = "";
    for (const die of this.enabledDice) {
      html += die.html;
    }
    return html;
  }

  /**
   * @returns {Teriock.MessageData.MessagePanel[]}
   */
  get panels() {
    return [
      {
        image: getImage("equipment", "Die"),
        name: game.i18n.localize("TERIOCK.MODELS.StatPool.PANELS.name"),
        bars: [],
        blocks: [
          {
            title: game.i18n.localize("TERIOCK.MODELS.StatPool.PANELS.title"),
            text: game.i18n.localize("TERIOCK.MODELS.StatPool.PANELS.text"),
          },
        ],
        icon: getRollIcon(this.formula),
      },
    ];
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

  /**
   * Total value of all stat dice in this pool.
   * @returns {number}
   */
  get value() {
    let value = 0;
    for (const die of this.dice) {
      if (!die.disabled) {
        value += die.value;
      }
    }
    return value;
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
    await this.parent.parent.update({
      [this.path]: data,
    });
  }
}
