import { icons } from "../../../../../constants/display/icons.mjs";

//noinspection JSClosureCompilerSyntax
import { makeIconClass } from "../../../../../helpers/utils.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * @param {typeof BaseActorSheet} Base
 */
export default (Base) =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class MechanicalActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        deathBagPull: this.#onDeathBagPull,
        quickUse: this._onQuickUse,
        toggleCondition: this.#onToggleCondition,
        increaseCover: this.#onIncreaseCover,
      },
      window: {
        controls: [
          {
            action: "deathBagPull",
            icon: makeIconClass(icons.ui.deathBag, "contextMenu"),
            label: "TERIOCK.EFFECTS.Common.bag",
            ownership: "OWNER",
          },
        ],
      },
    };

    /**
     * Pull from the Death Bag.
     * @returns {Promise<void>}
     */
    static async #onDeathBagPull() {
      await this.actor.system.deathBagPull();
    }

    /**
     * Increases cover by a step.
     * @returns {Promise<void>}
     */
    static async #onIncreaseCover() {
      if (this.document.system.cover < 3) {
        await this.document.system.increaseCover();
      } else {
        await this.document.system.decreaseCover(3);
      }
    }

    /**
     * Toggles a condition.
     * @param {PointerEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     */
    static async #onToggleCondition(event, target) {
      event.stopPropagation();
      const conditionKey = target.dataset.condition;
      await this.document.toggleStatusEffect(conditionKey);
    }

    /**
     * Quickly uses an item with optional modifiers.
     * @param {PointerEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     * @this MechanicalActorSheetPart
     */
    static async _onQuickUse(event, target) {
      await this.#onQuickUse(
        event,
        target,
        game.settings.get("teriock", "showRollDialogs"),
      );
    }

    /**
     * Quickly uses an item with optional modifiers.
     * @param {PointerEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @param {boolean} showDialog - Whether to show a dialog.
     * @returns {Promise<void>}
     */
    async #onQuickUse(event, target, showDialog) {
      event.stopPropagation();
      const id = target.dataset.id;
      const item = this.document.items.get(id);
      if (item) await item.use({ event, showDialog });
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this.element
        .querySelectorAll("[data-action='increaseCover']")
        .forEach((el) => {
          el.addEventListener("contextmenu", async () => {
            if (this.document.system.cover > 0) {
              await this.document.system.decreaseCover();
            } else {
              await this.document.system.increaseCover(3);
            }
          });
        });
      this.element.querySelectorAll("[data-action=quickUse]").forEach((el) => {
        el.addEventListener("contextmenu", async (ev) => {
          await this.#onQuickUse(
            ev,
            el,
            !game.settings.get("teriock", "showRollDialogs"),
          );
        });
      });
    }
  };
