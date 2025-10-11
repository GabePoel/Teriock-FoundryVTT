export default (Base) =>
  class MechanicalActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        deathBagPull: this._deathBagPull,
        endCondition: this._endCondition,
        quickUse: this._quickUse,
      },
    };

    /**
     * Pull from the Death Bag.
     * @returns {Promise<void>}
     * @static
     */
    static async _deathBagPull() {
      await this.actor.system.deathBagPull();
    }

    /**
     * Ends a condition with optional advantage/disadvantage.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when condition is ended.
     * @static
     */
    static async _endCondition(event, target) {
      event.stopPropagation();
      let message = null;
      if (target.classList.contains("tcard-image")) {
        const img = target.querySelector("img");
        if (img) {
          message = img.alt;
        }
      }
      const options = {
        advantage: event.altKey,
        disadvantage: event.shiftKey,
        message: message,
      };
      await this.actor.endCondition(options);
    }

    /**
     * Quickly uses an item with optional modifiers.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when item is used.
     * @static
     */
    static async _quickUse(event, target) {
      event.stopPropagation();
      const id = target.dataset.id;
      const item = this.document.items.get(id);
      if (item) {
        const options = {
          secret: true,
        };
        if (event.altKey) {
          options.advantage = true;
        }
        if (event.shiftKey) {
          options.disadvantage = true;
        }
        if (event.ctrlKey) {
          options.twoHanded = true;
        }
        await item.use(options);
      }
    }
  };
