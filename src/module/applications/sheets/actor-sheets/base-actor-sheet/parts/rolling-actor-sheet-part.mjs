import { ThresholdRoll } from "../../../../../dice/rolls/_module.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * @param {typeof BaseActorSheet} Base
 */
export default (Base) =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class RollingActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        rollFeatSave: this._onRollFeatSave,
        rollHexproof: this._onRollHexproof,
        rollHexseal: this._onRollHexseal,
        rollImmunity: this._onRollImmunity,
        rollResistance: this._onRollResistance,
        rollStatDie: this._onRollStatDie,
      },
    };

    /**
     * Rolls a feat save with optional advantage/disadvantage.
     * @param {PointerEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     * @this RollingActorSheetPart
     */
    static async _onRollFeatSave(event, target) {
      await this.#onRollFeatSave(
        event,
        target,
        game.settings.get("teriock", "showRollDialogs"),
      );
    }

    /**
     * Rolls hexproof resistance with optional advantage/disadvantage.
     * @param {PointerEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     * @this RollingActorSheetPart
     */
    static async _onRollHexproof(event, target) {
      await this.#onRollHexproof(
        event,
        target,
        game.settings.get("teriock", "showRollDialogs"),
      );
    }

    /**
     * Rolls hexseal immunity.
     * @param {PointerEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     */
    static async _onRollHexseal(event, target) {
      await this.actor.system.rollImmunity(
        Object.assign(protectionOptions(event, target), { hex: true }),
      );
    }

    /**
     * Rolls immunity.
     * @param {PointerEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     */
    static async _onRollImmunity(event, target) {
      await this.actor.system.rollImmunity(protectionOptions(event, target));
    }

    /**
     * Rolls resistance with optional advantage/disadvantage.
     * @param {PointerEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     * @this RollingActorSheetPart
     */
    static async _onRollResistance(event, target) {
      await this.#onRollResistance(
        event,
        target,
        game.settings.get("teriock", "showRollDialogs"),
      );
    }

    /**
     * Rolls a feat save with optional advantage/disadvantage.
     * @param {PointerEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @param {boolean} showDialog - Whether to show a dialog.
     * @returns {Promise<void>}
     */
    async #onRollFeatSave(event, target, showDialog) {
      await this.actor.system.rollFeatSave(target.dataset.attribute, {
        event,
        showDialog,
      });
    }

    /**
     * Rolls hexproof resistance with optional advantage/disadvantage.
     * @param {PointerEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @param {boolean} showDialog - Whether to show a dialog.
     * @returns {Promise<void>}
     */
    async #onRollHexproof(event, target, showDialog) {
      await this.actor.system.rollResistance(
        Object.assign(protectionOptions(event, target), {
          hex: true,
          showDialog,
        }),
      );
    }

    /**
     * Rolls resistance with optional advantage/disadvantage.
     * @param {PointerEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @param {boolean} showDialog - Whether to show a dialog.
     * @returns {Promise<void>}
     */
    async #onRollResistance(event, target, showDialog) {
      await this.actor.system.rollResistance(
        Object.assign(protectionOptions(event, target), {
          showDialog,
        }),
      );
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this.element
        .querySelectorAll("[data-action=rollFeatSave]")
        .forEach((el) => {
          el.addEventListener("contextmenu", async (ev) => {
            await this.#onRollFeatSave(
              ev,
              el,
              !game.settings.get("teriock", "showRollDialogs"),
            );
          });
        });
      this.element
        .querySelectorAll("[data-action=rollResistance]")
        .forEach((el) => {
          el.addEventListener("contextmenu", async (ev) => {
            await this.#onRollResistance(
              ev,
              el,
              !game.settings.get("teriock", "showRollDialogs"),
            );
          });
        });
      this.element
        .querySelectorAll("[data-action=rollHexproof]")
        .forEach((el) => {
          el.addEventListener("contextmenu", async (ev) => {
            await this.#onRollHexproof(
              ev,
              el,
              !game.settings.get("teriock", "showRollDialogs"),
            );
          });
        });
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
 * @param {PointerEvent} event - The event object.
 * @param {HTMLElement} target
 * @returns {Partial<Teriock.Execution.ImmunityExecutionOptions>}
 */
function protectionOptions(event, target) {
  const img = target.querySelector("img");
  const block = target.closest(".teriock-block");
  const options = {
    wrappers: [
      block?.querySelector(".teriock-block-title")?.textContent || "",
      block?.querySelector(".teriock-block-subtitle")?.textContent || "",
    ],
  };
  if (img?.src) {
    options.image = img.src;
  }
  return Object.assign(options, ThresholdRoll.parseEvent(event));
}
