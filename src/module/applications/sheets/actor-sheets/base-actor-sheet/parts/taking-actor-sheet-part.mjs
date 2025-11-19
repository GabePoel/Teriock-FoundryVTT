import { toCamelCase, toTitleCase } from "../../../../../helpers/string.mjs";
import { TeriockDialog } from "../../../../api/_module.mjs";
import { HackStatMixin } from "../../../../shared/mixins/_module.mjs";

export default (Base) =>
  class TakingActorSheetPart extends HackStatMixin(Base) {
    static DEFAULT_OPTIONS = {
      actions: {
        takeHack: this._takeHack,
        takeRollable: this._takeRollable,
      },
    };

    /**
     * Prompt for taking some amount of something and applying it to the actor.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     * @private
     */
    static async _takeRollable(_event, target) {
      const type = target.dataset.type;
      await TeriockDialog.prompt({
        window: {
          title: `Take ${toTitleCase(type)}`,
          icon: TERIOCK.display.buttons.rollButtons[type].icon,
        },
        content: `<input type="number" name="${type}" placeholder="${toTitleCase(type)} Amount">`,
        ok: {
          label: "Confirm",
          callback: (_event, button) => {
            let input = button.form.elements.namedItem(type).value;
            if (input) {
              this.document.system[toCamelCase(`Take ${toTitleCase(type)}`)](
                Number(input),
              );
            }
          },
        },
      });
    }
  };
