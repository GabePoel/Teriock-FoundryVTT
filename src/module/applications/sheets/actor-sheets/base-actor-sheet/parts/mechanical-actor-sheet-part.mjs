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
        quickUse: this.#onQuickUse,
        toggleCondition: this.#onToggleCondition,
        increaseCover: this.#onIncreaseCover,
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
      await this.document.system.increaseCover();
    }

    /**
     * Quickly uses an item with optional modifiers.
     * @param {PointerEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     */
    static async #onQuickUse(event, target) {
      event.stopPropagation();
      const id = target.dataset.id;
      const item = this.document.items.get(id);
      if (item) await item.use({ event });
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

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this.element
        .querySelectorAll("[data-action='increaseCover']")
        .forEach((el) => {
          el.addEventListener(
            "contextmenu",
            async () => await this.document.system.decreaseCover(),
          );
        });
    }
  };
