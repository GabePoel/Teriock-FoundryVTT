import { TeriockRoll } from "../../documents/_module.mjs";
import { dedent } from "../../helpers/utils.mjs";

const fields = foundry.data.fields;

/**
 * A data model to represent a stat die.
 */
export default class StatDieModel extends foundry.abstract.DataModel {
  await;

  /**
   * The ID of this stat die.
   *
   * @type {string}
   */
  get id() {
    return this._id;
  }

  /**
   * This stat die's path within its parent document.
   *
   * @returns {string}
   */
  get path() {
    return `system.${this.stat}Dice.${this.id}`;
  }

  /**
   * A name for this type of die.
   *
   * @returns {"Hit Die" | "Mana Die"}
   */
  get name() {
    return `${this.stat === "hp" ? "Hit" : "Mana"} Die`;
  }

  /**
   * String representing this die.
   *
   * @returns {Teriock.RollOptions.PolyhedralDie}
   */
  get polyhedral() {
    return /** @type {Teriock.RollOptions.PolyhedralDie} */ `d${this.faces}`;
  }

  /**
   * Render a die box HTML element. Creates a clickable die icon that shows whether the die has been used or not.
   */
  get rendered() {
    const iconClass = `fa-fw fa-${this.spent ? "light" : "solid"} fa-dice-d${this.faces}`;
    return dedent(`
      <div
        class="thover die-box ${this.spent ? "rolled" : "unrolled"}"
        data-die="d${this.faces}"
        data-id="${this.id}"
        data-parent-id="${this.parent.parent.id}"
        data-stat="${this.stat}"
        data-action="rollStatDie"
        data-tooltip-html="<div style='display: flex; flex-direction: column; align-items: center;'><div>d${this.faces} ${this.name}</div><div>(${this.parent.parent.name})</div></div>"
        data-tooltip-direction="DOWN"
      >
        <i class="${iconClass}"></i>
      </div>`);
  }

  /** @inheritDoc */
  static defineSchema() {
    return {
      _id: new fields.DocumentIdField({
        initial: () => foundry.utils.randomID(),
      }),
      stat: new fields.StringField({
        label: "Die Type",
        hint: "What stat this die corresponds to.",
        choices: {
          hp: "Hit Die",
          mp: "Mana Die",
        },
        initial: "hp",
      }),
      faces: new fields.NumberField({
        label: "Faces",
        hint: "How many faces this die has.",
        initial: 10,
        choices: {
          2: "2",
          4: "4",
          6: "6",
          8: "8",
          10: "10",
          12: "12",
          20: "20",
        },
      }),
      spent: new fields.BooleanField({
        label: "Spent",
        hint: "Whether or not this die has been spent.",
        initial: false,
      }),
      value: new fields.NumberField({
        label: "Value",
        hint: "The amount this die contributes to the total value of the stat it corresponds to.",
        initial: 5,
      }),
    };
  }

  /**
   * Roll this stat die.
   *
   * @param {boolean} [spend] - If this should consume the stat die.
   * @returns {Promise<void>}
   */
  async rollStatDie(spend = true) {
    const actor = this.parent.parent.actor;
    if (!actor) return;
    const roll = new TeriockRoll(`1d${this.faces}`, {});
    await roll.evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: `Rolling ${this.name}`,
    });
    if (this.stat === "hp") await actor.takeHeal(roll.total);
    if (this.stat === "mp") await actor.takeRevitalize(roll.total);
    if (spend)
      await this.parent.parent.update({ [`${this.path}.spent`]: true });
  }

  /**
   * Unroll this stat die.
   *
   * @returns {Promise<void>}
   */
  async unrollStatDie() {
    await this.parent.parent.update({ [`${this.path}.spent`]: false });
  }

  /**
   * Roll the value of this stat die.
   *
   * @returns {Promise<void>}
   */
  async rollStatDieValue() {
    const actor = this.parent.parent.actor;
    const roll = new TeriockRoll(`1d${this.faces}`, {});
    await roll.evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: `Rolling ${this.stat.toUpperCase()}`,
    });
    await this.parent.parent.update({ [`${this.path}.value`]: roll.total });
  }
}
