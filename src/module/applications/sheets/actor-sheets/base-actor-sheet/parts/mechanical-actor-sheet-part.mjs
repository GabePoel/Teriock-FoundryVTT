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
        increaseCover: this.#onIncreaseCover,
        quickUse: this._onQuickUse,
        takeLongRest: this.#onTakeLongRest,
        takeShortRest: this.#onTakeShortRest,
        toggleCondition: this.#onToggleCondition,
      },
      window: {
        controls: [
          {
            action: "deathBagPull",
            icon: makeIconClass(icons.ui.deathBag, "contextMenu"),
            label: "TERIOCK.EFFECTS.Common.bag",
            ownership: "OWNER",
          },
          {
            action: "takeLongRest",
            icon: makeIconClass(icons.ui.longRest, "contextMenu"),
            label: "TERIOCK.SHEETS.Actor.ACTIONS.TakeLongRest.label",
            ownership: "OWNER",
          },
          {
            action: "takeShortRest",
            icon: makeIconClass(icons.ui.shortRest, "contextMenu"),
            label: "TERIOCK.SHEETS.Actor.ACTIONS.TakeShortRest.label",
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
     * Take a long rest.
     * @returns {Promise<void>}
     */
    static async #onTakeLongRest() {
      await this.actor.system.takeLongRest();
    }

    /**
     * Take a short rest.
     * @returns {Promise<void>}
     */
    static async #onTakeShortRest() {
      await this.actor.system.takeShortRest();
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
