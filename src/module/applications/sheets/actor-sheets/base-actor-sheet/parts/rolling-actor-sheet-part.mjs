import { makeCommonRollOptions } from "../../../../../helpers/utils.mjs";

export default (Base) =>
  class RollingActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        rollFeatSave: this._rollFeatSave,
        rollImmunity: this._rollImmunity,
        rollHexproof: this._rollHexproof,
        rollResistance: this._rollResistance,
        rollHexseal: this._rollHexseal,
        rollStatDie: this._rollStatDie,
      },
    };

    /**
     * Rolls a feat save with optional advantage/disadvantage.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when feat save is rolled.
     * @static
     */
    static async _rollFeatSave(event, target) {
      const attribute = target.dataset.attribute;
      const options = makeCommonRollOptions(event);
      await this.actor.system.rollFeatSave(attribute, options);
    }

    /**
     * Rolls hexproof resistance with optional advantage/disadvantage.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when resistance is rolled.
     * @static
     */
    static async _rollHexproof(event, target) {
      const options = protectionOptions(event, target);
      options.hex = true;
      await this.actor.system.rollResistance(options);
    }

    /**
     * Rolls hexseal immunity.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when immunity is rolled.
     * @static
     */
    static async _rollHexseal(event, target) {
      const options = protectionOptions(event, target);
      options.hex = true;
      await this.actor.system.rollImmunity(options);
    }

    /**
     * Rolls immunity.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when immunity is rolled.
     * @static
     */
    static async _rollImmunity(event, target) {
      const options = protectionOptions(event, target);
      await this.actor.system.rollImmunity(options);
    }

    /**
     * Rolls resistance with optional advantage/disadvantage.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when resistance is rolled.
     * @static
     */
    static async _rollResistance(event, target) {
      const options = protectionOptions(event, target);
      await this.actor.system.rollResistance(options);
    }
  };

/**
 * Get the protection options for a target.
 * @param {MouseEvent} event - The event object.
 * @param {HTMLElement} target
 * @returns {Partial<Teriock.Execution.ImmunityExecutionOptions>}
 * @private
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
