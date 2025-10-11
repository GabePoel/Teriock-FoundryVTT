import { TeriockDialog } from "../../../../api/_module.mjs";
import { HackStatMixin } from "../../../../shared/mixins/_module.mjs";

export default (Base) =>
  class TakingActorSheetPart extends HackStatMixin(Base) {
    static DEFAULT_OPTIONS = {
      actions: {
        takeDamage: this._takeDamage,
        takeDrain: this._takeDrain,
        takeHack: this._takeHack,
        takeWither: this._takeWither,
      },
    };

    /**
     * Prompts for damage amount and applies it to the actor.
     * @param {MouseEvent} event - The event object.
     * @returns {Promise<void>} Promise that resolves when damage is applied.
     * @static
     */
    static async _takeDamage(event) {
      event.stopPropagation();
      await TeriockDialog.prompt({
        window: { title: "Take Damage" },
        content:
          '<input type="number" name="damage" placeholder="Damage Amount">',
        ok: {
          label: "Confirm",
          callback: (_event, button) => {
            let input = button.form.elements.namedItem("damage").value;
            if (input) {
              this.document.system.takeDamage(Number(input));
            }
          },
        },
      });
    }

    /**
     * Prompts for drain amount and applies it to the actor.
     * @param {MouseEvent} event - The event object.
     * @returns {Promise<void>} Promise that resolves when drain is applied.
     * @static
     */
    static async _takeDrain(event) {
      event.stopPropagation();
      await TeriockDialog.prompt({
        window: { title: "Take Drain" },
        content:
          '<input type="number" name="drain" placeholder="Drain Amount">',
        ok: {
          label: "Confirm",
          callback: (_event, button) => {
            let input = button.form.elements.namedItem("drain").value;
            if (input) {
              this.document.system.takeDrain(Number(input));
            }
          },
        },
      });
    }

    /**
     * Prompts for wither amount and applies it to the actor.
     * @param {MouseEvent} event - The event object.
     * @returns {Promise<void>} Promise that resolves when wither is applied.
     * @static
     */
    static async _takeWither(event) {
      event.stopPropagation();
      await TeriockDialog.prompt({
        window: { title: "Take Wither" },
        content:
          '<input type="number" name="wither" placeholder="Wither Amount">',
        ok: {
          label: "Confirm",
          callback: (_event, button) => {
            let input = button.form.elements.namedItem("wither").value;
            if (input) {
              this.document.system.takeWither(Number(input));
            }
          },
        },
      });
    }
  };
