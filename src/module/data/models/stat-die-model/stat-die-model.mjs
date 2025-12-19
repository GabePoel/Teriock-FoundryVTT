import { TeriockDialog } from "../../../applications/api/_module.mjs";
import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { TeriockRoll } from "../../../dice/_module.mjs";
import { TeriockChatMessage } from "../../../documents/_module.mjs";
import { dedent } from "../../../helpers/string.mjs";
import { getRollIcon, makeIconClass } from "../../../helpers/utils.mjs";
import EmbeddedDataModel from "../embedded-data-model/embedded-data-model.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * @implements {Teriock.Models.StatDieModelInterface}
 * @implements {StatDieData}
 */
export default class StatDieModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static defineSchema() {
    return {
      spent: new fields.BooleanField({
        initial: false,
        required: false,
      }),
      value: new fields.NumberField({
        initial: 1,
        required: false,
      }),
      rolled: new fields.BooleanField({
        initial: false,
        required: false,
      }),
      flavor: new fields.StringField({
        initial: "",
        required: false,
      }),
    };
  }

  /**
   * Formula representing rolling this die.
   * @returns {string}
   */
  get formula() {
    return `1${this.polyhedral}${this.flavor ? `[${this.flavor}]` : ""}`;
  }

  /**
   * Render a die box HTML element. Creates a clickable die icon that shows whether the die has been used or not.
   * @returns {string}
   */
  get html() {
    const element = document.createElement("div");
    element.classList.add(
      ...["thover", "die-box", this.spent ? "rolled" : "unrolled"],
    );
    element.dataset.document = this.parent.parent.parent.id;
    element.dataset.collection = this.parent.parent.parent.collectionName;
    element.dataset.stat = this.parent.stat;
    element.dataset.index = this.index.toString();
    element.dataset.action = "rollStatDie";
    element.dataset.tooltipHtml = dedent(`
      <div style='display: flex; flex-direction: column; align-items: center;'>
        <div>d${this.faces} ${this.name}</div><div>(${this.parent.parent.parent.name})</div>
      </div>`);
    element.dataset.tooltipDirection = "DOWN";
    const icon = document.createElement("i");
    icon.classList.add(
      ...[
        "fa-fw",
        `fa-${this.spent ? "light" : "solid"}`,
        `fa-${getRollIcon(this.polyhedral)}`,
      ],
    );
    element.append(icon);
    return element.outerHTML;
  }

  /**
   * Name for this die.
   * @returns {string}
   */
  get name() {
    return this.parent.dieName;
  }

  /** @returns {StatPoolModel} */
  get parent() {
    //noinspection JSValidateTypes
    return super.parent;
  }

  /**
   * String representing this die.
   * @returns {Teriock.RollOptions.PolyhedralDie}
   */
  get polyhedral() {
    return /** @type {Teriock.RollOptions.PolyhedralDie} */ `d${this.faces}`;
  }

  /**
   * Toggle whether this die is spent.
   * @param {boolean} [spent]
   * @returns {Promise<void>}
   */
  async toggle(spent) {
    if (typeof spent === "undefined") {
      spent = !this.spent;
    }
    const dice = this.parent.dice.map((d) => d.toObject());
    dice[this.index].spent = spent;
    const updatePath = `system.statDice.${this.parent.stat}.dice`;
    await this.parent.parent.parent.update({
      [updatePath]: dice,
    });
  }

  /**
   * Unuse this die.
   * @returns {Promise<void>}
   */
  async unuse() {
    await this.toggle(false);
  }

  /**
   * Use this die.
   * @param {boolean} [spend]
   * @returns {Promise<void>}
   */
  async use(spend = true) {
    let proceed = !this.spent;
    if (this.spent) {
      if (!game.settings.get("teriock", "confirmStatDiceRerolls")) {
        proceed = true;
      } else {
        proceed = await TeriockDialog.confirm({
          window: {
            title: "Reroll Stat Die?",
            icon: makeIconClass(getRollIcon(this.formula), "title"),
          },
          content:
            "This stat die is already spent. Would you like to roll it anyways?",
          modal: true,
          rejectClose: false,
        });
      }
    }
    if (proceed) {
      const panels = this.parent.panels;
      await TeriockTextEditor.enrichPanels(panels);
      const roll = new TeriockRoll(
        this.formula,
        {},
        {
          flavor: this.parent.dieName.replace("Dice", "Die") + " Roll",
        },
      );
      await roll.evaluate();
      const callback = this.parent.callback;
      await callback(roll.total);
      await TeriockChatMessage.create({
        speaker: TeriockChatMessage.getSpeaker({
          actor: this.parent.parent.parent.actor,
        }),
        system: {
          avatar: this.parent.parent.parent.actor.img,
          panels: panels,
        },
        rolls: [roll],
      });
      if (spend) {
        await this.toggle(true);
      }
    }
  }
}
