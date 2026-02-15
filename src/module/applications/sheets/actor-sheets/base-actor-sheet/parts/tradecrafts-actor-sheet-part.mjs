//noinspection JSClosureCompilerSyntax
/**
 * @param {typeof BaseActorSheet} Base
 */
export default (Base) =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class TradecraftsActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        rollTradecraft: this._onRollTradecraft,
      },
    };

    /**
     * Rolls a tradecraft check with optional advantage/disadvantage.
     * @param {PointerEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     */
    static async _onRollTradecraft(event, target) {
      await this.actor.system.rollTradecraft(target.dataset.tradecraft, {
        event,
      });
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      const index = game.teriock.packs.player.index;
      context.tradecraftMacros = Object.fromEntries(
        Object.entries(TERIOCK.index.tradecrafts).map(([tc, name]) => [
          tc,
          index.getName(`Make ${name} Check`).uuid,
        ]),
      );
      return context;
    }
  };
