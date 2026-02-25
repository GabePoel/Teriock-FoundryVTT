import { TeriockDialog } from "../../../applications/api/_module.mjs";
import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../../documents/_module.mjs";
import { dedent } from "../../../helpers/string.mjs";
import { getRollIcon, makeIconClass } from "../../../helpers/utils.mjs";
import EmbeddedDataModel from "../embedded-data-model.mjs";

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
      rolled: new fields.BooleanField({
        initial: false,
        required: false,
      }),
      spent: new fields.BooleanField({
        initial: false,
        required: false,
      }),
      value: new fields.NumberField({
        initial: 1,
        required: false,
      }),
    };
  }

  /**
   * Number of faces this die has.
   * @returns {number}
   */
  get faces() {
    return this.parent.faces || 10;
  }

  /**
   * Flavor.
   * @returns {string}
   */
  get flavor() {
    return this.parent.flavor || "";
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
    Object.assign(element.dataset, {
      action: "rollStatDie",
      collection: this.parent.parent.parent.collectionName,
      document: this.parent.parent.parent.id,
      index: this.index.toString(),
      stat: this.parent.stat,
      tooltipDirection: "DOWN",
      tooltipHtml: dedent(`
      <div style='display: flex; flex-direction: column; align-items: center;'>
        <div>d${this.faces} ${this.name}</div><div>(${this.parent.parent.parent.name})</div>
      </div>`),
    });
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
   * @returns {Teriock.Rolls.PolyhedralDie}
   */
  get polyhedral() {
    return /** @type {Teriock.Rolls.PolyhedralDie} */ `d${this.faces}`;
  }

  /**
   * The stat this modifies.
   * @returns {string}
   */
  get stat() {
    return this.parent.stat || "";
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
          content: game.i18n.localize(
            "TERIOCK.MODELS.StatDie.DIALOG.Reroll.content",
          ),
          modal: true,
          rejectClose: false,
          window: {
            icon: makeIconClass(getRollIcon(this.formula), "title"),
            title: game.i18n.localize(
              "TERIOCK.MODELS.StatDie.DIALOG.Reroll.title",
            ),
          },
        });
      }
    }
    if (proceed) {
      const panels = this.parent.panels;
      await TeriockTextEditor.enrichPanels(panels);
      const roll = new BaseRoll(
        this.formula,
        {},
        {
          flavor: game.i18n.format("TERIOCK.ROLLS.Base.name", {
            value: this.parent.dieName,
          }),
        },
      );
      await roll.evaluate();
      const callback = this.parent.callback;
      await callback(roll.total);
      await TeriockChatMessage.create({
        rolls: [roll],
        speaker: TeriockChatMessage.getSpeaker({
          actor: this.parent.parent.parent.actor,
        }),
        system: {
          avatar: this.parent.parent.parent.actor.img,
          panels: panels,
        },
      });
      if (spend) {
        await this.toggle(true);
      }
    }
  }
}
