/**
 * @param {typeof BaseActorSheet} Base
 */
export default Base =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class TradecraftsActorSheetPart extends Base {
    /**
     * Rolls a tradecraft check with optional advantage/disadvantage.
     * @param {PointerEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     */
    static async #onRollTradecraft(event, target) {
      await this.actor.system.rollTradecraft(target.dataset.tradecraft, { event });
    }

    static DEFAULT_OPTIONS = { actions: { rollTradecraft: { buttons: [0, 2], handler: this.#onRollTradecraft } } };

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      const tcFields = foundry.utils.deepClone(TERIOCK.config.tradecraft);
      delete tcFields.prestige;
      context.tradecraftFields = tcFields;

      const p1 = foundry.utils.deepClone(TERIOCK.config.tradecraft.prestige);
      const p2 = foundry.utils.deepClone(TERIOCK.config.tradecraft.prestige);
      delete p1.tradecrafts.tinkerer;
      delete p2.tradecrafts.metaphysicist;
      context.prestigeFields = { p1, p2 };

      const index = game.teriock.packs.player.index;
      context.tradecraftMacros = Object.fromEntries(
        Object.entries(TERIOCK.index.tradecrafts).map(([tc, name]) => [tc, index.getName(`Make ${name} Check`)?.uuid]),
      );
      return context;
    }
  };
