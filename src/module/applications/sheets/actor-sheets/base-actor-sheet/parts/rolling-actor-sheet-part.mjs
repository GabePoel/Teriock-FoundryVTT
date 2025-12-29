import { makeCommonRollOptions } from "../../../../../helpers/rolling.mjs";

export default (Base) =>
  class RollingActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        rollFeatSave: this._onRollFeatSave,
        rollImmunity: this._onRollImmunity,
        rollHexproof: this._onRollHexproof,
        rollResistance: this._onRollResistance,
        rollHexseal: this._onRollHexseal,
        rollStatDie: this._onRollStatDie,
      },
    };

    /**
     * Rolls a feat save with optional advantage/disadvantage.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     */
    static async _onRollFeatSave(event, target) {
      const attribute = target.dataset.attribute;
      const options = makeCommonRollOptions(event);
      await this.actor.system.rollFeatSave(attribute, options);
    }

    /**
     * Rolls hexproof resistance with optional advantage/disadvantage.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     */
    static async _onRollHexproof(event, target) {
      const options = protectionOptions(event, target);
      options.hex = true;
      await this.actor.system.rollResistance(options);
    }

    /**
     * Rolls hexseal immunity.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     */
    static async _onRollHexseal(event, target) {
      const options = protectionOptions(event, target);
      options.hex = true;
      await this.actor.system.rollImmunity(options);
    }

    /**
     * Rolls immunity.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     */
    static async _onRollImmunity(event, target) {
      const options = protectionOptions(event, target);
      await this.actor.system.rollImmunity(options);
    }

    /**
     * Rolls resistance with optional advantage/disadvantage.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     */
    static async _onRollResistance(event, target) {
      const options = protectionOptions(event, target);
      await this.actor.system.rollResistance(options);
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      const index = game.teriock.packs.player.index;
      context.attributeMacros = Object.fromEntries(
        Object.keys(TERIOCK.index.attributesFull).map((att) => [
          att,
          index.getName(`Make ${att.toUpperCase()} Feat Save`).uuid,
        ]),
      );
      return context;
    }
  };

/**
 * Get the protection options for a target.
 * @param {MouseEvent} event - The event object.
 * @param {HTMLElement} target
 * @returns {Partial<Teriock.Execution.ImmunityExecutionOptions>}
 */
function protectionOptions(event, target) {
  const img = target.querySelector("img");
  const block = target.closest(".teriock-block");
  const options = {
    advantage: event.altKey,
    disadvantage: event.shiftKey,
    wrappers: [
      block?.querySelector(".teriock-block-title")?.textContent || "",
      block?.querySelector(".teriock-block-subtitle")?.textContent || "",
    ],
  };
  if (img?.src) {
    options.image = img.src;
  }
  return options;
}
