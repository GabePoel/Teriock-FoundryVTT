import { tradecraftPanel } from "../../../../../helpers/html.mjs";
import { TeriockTextEditor } from "../../../../ux/_module.mjs";

export default (Base) =>
  class TradecraftsActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        tradecraftExtra: this._tradecraftExtra,
        rollTradecraft: this._rollTradecraft,
      },
    };

    /**
     * Rolls a tradecraft check with optional advantage/disadvantage.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when tradecraft is rolled.
     * @static
     */
    static async _rollTradecraft(event, target) {
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
    static async _tradecraftExtra(_event, target) {
      const tradecraft = target.dataset.tradecraft;
      const extra = this.document.system.tradecrafts[tradecraft].extra;
      const newExtra = (extra + 1) % 3;
      await this.document.update({
        [`system.tradecrafts.${tradecraft}.extra`]: newExtra,
      });
    }

    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      context.tradecraftTooltips = {};
      for (const tc of Object.keys(TERIOCK.index.tradecrafts)) {
        context.tradecraftTooltips[tc] = await TeriockTextEditor.makeTooltip(
          await tradecraftPanel(tc),
        );
      }
      return context;
    }
  };
