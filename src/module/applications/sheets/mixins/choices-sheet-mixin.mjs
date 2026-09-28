/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * Mixin to support manipulating choices in choice automations.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function ChoicesSheetMixin(Base) {
  /** @mixin */
  class ChoicesSheet extends Base {
    /**
     * Add a blank choice to a choice automation.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onCreateChoice(_event, target) {
      const automation = await fromUuid(target.dataset.uuid);
      if (!automation) { return; }
      await automation.getNearestDocument().update({
        [`${automation.localPath}.choices.${foundry.utils.randomID()}`]: { label: "", value: "" },
      });
    }

    /**
     * Delete a choice from a choice automation.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onDeleteChoice(_event, target) {
      const automation = await fromUuid(target.dataset.uuid);
      if (!automation) { return; }
      const choices = automation.toObject().choices;
      delete choices[target.dataset.choiceId];
      await automation.getNearestDocument().update({ [`${automation.localPath}.choices`]: _replace(choices) });
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = { actions: { createChoice: this.#onCreateChoice, deleteChoice: this.#onDeleteChoice } };
  }

  return ChoicesSheet;
}
