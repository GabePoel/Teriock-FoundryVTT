export default (Base) =>
  class MechanicalActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        deathBagPull: this._deathBagPull,
        quickUse: this._quickUse,
        toggleCondition: this._toggleCondition,
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
          secret: game.settings.get("teriock", "secretEquipment"),
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

    /**
     * Toggles a condition.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when condition is toggled.
     * @static
     */
    static async _toggleCondition(event, target) {
      event.stopPropagation();
      const conditionKey = target.dataset.condition;
      await this.document.toggleStatusEffect(conditionKey);
    }
  };
