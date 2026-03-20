import { TeriockDialog } from "../../../applications/api/_module.mjs";
import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../../documents/_module.mjs";
import { getRollIcon, makeIconClass } from "../../../helpers/utils.mjs";
import EmbeddedDataModel from "../embedded-data-model.mjs";

const { fields } = foundry.data;

/**
 * @extends {Teriock.Models.StatDieModelData}
 */
export default class StatDieModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static defineSchema() {
    return {
      _id: new fields.DocumentIdField({ required: true }),
      faces: new fields.NumberField({
        integer: true,
        required: true,
      }),
      index: new fields.NumberField({
        integer: true,
        required: true,
      }),
    };
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
   * An icon that represents this.
   * @return {string}
   */
  get icon() {
    return getRollIcon(this.formula);
  }

  /**
   * The ID for this stat die.
   * @return {ID<StatDieModel>}
   */
  get id() {
    return this._id;
  }

  /**
   * Name for this die.
   * @returns {string}
   */
  get name() {
    return this.parent.dieName;
  }

  /**
   * String representing this die.
   * @returns {Teriock.Rolls.PolyhedralDie}
   */
  get polyhedral() {
    return /** @type {Teriock.Rolls.PolyhedralDie} */ `d${this.faces}`;
  }

  /**
   * Whether this stat die is spent.
   * @return {boolean}
   */
  get spent() {
    return this.parent.spent.has(this.index);
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
    if (typeof spent === "undefined") spent = !this.spent;
    const spentCopy = new Set(Array.from(this.parent.spent));
    if (spent) spentCopy.add(this.index);
    else spentCopy.delete(this.index);
    const updatePath = `system.statDice.${this.parent.stat}.spent`;
    await this.parent.parent.parent.update({
      [updatePath]: Array.from(spentCopy),
    });
  }

  /**
   * Use this die.
   * @param {boolean} [spend]
   * @returns {Promise<void>}
   */
  async use(spend = true) {
    let proceed = !this.spent;
    if (this.spent) {
      if (!game.teriock.getSetting("confirmStatDiceRerolls")) {
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
      const messageData = {
        rolls: [roll],
        speaker: TeriockChatMessage.getSpeaker({
          actor: this.parent.parent.parent.actor,
        }),
        system: {
          avatar: this.parent.parent.parent.actor.img,
          panels: panels,
        },
      };
      await TeriockChatMessage.create(messageData, { defaultMode: true });
      if (spend) {
        await this.toggle(true);
      }
    }
  }
}
