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
     * @this TradecraftsActorSheetPart
     */
    static async _onRollTradecraft(event, target) {
      await this.#onRollTradecraft(
        event,
        target,
        game.settings.get("teriock", "showRollDialogs"),
      );
    }

    /**
     * Rolls a tradecraft check with optional advantage/disadvantage.
     * @param {PointerEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @param {boolean} showDialog - Whether to show a dialog.
     * @returns {Promise<void>}
     */
    async #onRollTradecraft(event, target, showDialog) {
      await this.actor.system.rollTradecraft(target.dataset.tradecraft, {
        event,
        showDialog,
      });
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this.element
        .querySelectorAll("[data-action=rollTradecraft]")
        .forEach((el) => {
          el.addEventListener("contextmenu", async (ev) => {
            await this.#onRollTradecraft(
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
      context.tradecraftMacros = Object.fromEntries(
        Object.entries(TERIOCK.reference.tradecrafts).map(([tc, name]) => [
          tc,
          index.getName(`Make ${name} Check`).uuid,
        ]),
      );
      return context;
    }
  };
