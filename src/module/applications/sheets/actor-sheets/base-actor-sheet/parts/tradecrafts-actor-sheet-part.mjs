export default (Base) =>
  class TradecraftsActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        tradecraftExtra: this._onTradecraftExtra,
        rollTradecraft: this._onRollTradecraft,
      },
    };

    /**
     * Rolls a tradecraft check with optional advantage/disadvantage.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when tradecraft is rolled.
     * @static
     */
    static async _onRollTradecraft(event, target) {
      const tradecraft = target.dataset.tradecraft;
      const options = {};
      if (event.altKey) {
        options.advantage = true;
      }
      if (event.shiftKey) {
        options.disadvantage = true;
      }
      await this.actor.system.rollTradecraft(tradecraft, options);
    }

    /**
     * Cycles through tradecraft extra levels (0, 1, 2).
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when tradecraft extra is updated.
     * @static
     */
    static async _onTradecraftExtra(_event, target) {
      const tradecraft = target.dataset.tradecraft;
      const score = this.document.system.tradecrafts[tradecraft].score;
      const newScore = (score + 1) % 4;
      await this.document.update({
        [`system.tradecrafts.${tradecraft}.score`]: newScore,
      });
    }
  };
