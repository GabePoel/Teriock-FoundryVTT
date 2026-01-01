import { toCamelCase, toTitleCase } from "../../../../../helpers/string.mjs";
import { makeIconClass } from "../../../../../helpers/utils.mjs";
import { TeriockDialog } from "../../../../api/_module.mjs";
import { HackStatMixin } from "../../../../shared/mixins/_module.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * @param {typeof TeriockBaseActorSheet} Base
 */
export default (Base) =>
  /**
   * @extends {TeriockBaseActorSheet}
   * @mixin
   */
  class TakingActorSheetPart extends HackStatMixin(Base) {
    static DEFAULT_OPTIONS = {
      actions: {
        takeHack: this._onTakeHack,
        takeRollable: this._onTakeRollable,
      },
    };

    /**
     * Prompt for taking some amount of something and applying it to the actor.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async _onTakeRollable(_event, target) {
      const type = target.dataset.type;
      await TeriockDialog.prompt({
        window: {
          title: `Take ${toTitleCase(type)}`,
          icon: makeIconClass(TERIOCK.options.take[type].icon, "title"),
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

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this.element.querySelectorAll("[data-action='takeRollable']").forEach(
        /** @param {HTMLElement} el */ (el) => {
          el.addEventListener("contextmenu", async () => {
            const type = el.dataset.type;
            if (["damage", "drain"].includes(type)) {
              await TeriockDialog.prompt({
                window: {
                  title: `Set Morganti ${toTitleCase(type)}`,
                  icon: makeIconClass(TERIOCK.options.take[type].icon, "title"),
                },
                content: `<input type="number" name="${type}" placeholder="Set Morganti ${toTitleCase(type)} Amount">`,
                ok: {
                  label: "Confirm",
                  callback: async (_event, button) => {
                    let input = button.form.elements.namedItem(type).value;
                    if (input) {
                      let stat;
                      if (type === "damage") stat = "hp";
                      if (type === "drain") stat = "mp";
                      await this.document.update({
                        [`system.${stat}.morganti`]: input,
                      });
                    }
                  },
                },
              });
            }
          });
        },
      );
    }
  };
