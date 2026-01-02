import { toCamelCase, toTitleCase } from "../../../../../helpers/string.mjs";
import { makeIconClass } from "../../../../../helpers/utils.mjs";
import { TeriockDialog } from "../../../../api/_module.mjs";
import { HackStatMixin } from "../../../../shared/mixins/_module.mjs";

const { fields } = foundry.data;

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
      const field = new fields.NumberField({
        initial: 0,
        label: toTitleCase(type),
        min: 0,
        integer: true,
        hint: `The amount of ${toTitleCase(type).toLowerCase()} to take.`,
      });
      await TeriockDialog.prompt({
        window: {
          title: `Take ${toTitleCase(type)}`,
          icon: makeIconClass(TERIOCK.options.take[type].icon, "title"),
        },
        content: field.toFormGroup({}, { name: type }).outerHTML,
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

    /**
     * Prompt for applying some amount of morganti damage or drain.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     * @private
     */
    async _applyMorganti(_event, target) {
      const type = target.dataset.type;
      let stat;
      if (type === "damage") stat = "hp";
      if (type === "drain") stat = "mp";
      if (["damage", "drain"].includes(type)) {
        const field = new fields.NumberField({
          initial: this.document.system[stat].morganti ?? 0,
          label: `Morganti ${toTitleCase(type)}`,
          min: 0,
          integer: true,
          hint: `The total amount of morganti ${toTitleCase(type).toLowerCase()} you have ever taken.`,
        });
        await TeriockDialog.prompt({
          window: {
            title: `Set Morganti ${toTitleCase(type)}`,
            icon: makeIconClass(TERIOCK.options.take[type].icon, "title"),
          },
          content: field.toFormGroup({}, { name: type }).outerHTML,
          ok: {
            label: "Confirm",
            callback: async (_event, button) => {
              let input = button.form.elements.namedItem(type).value;
              if (input) {
                await this.document.update({
                  [`system.${stat}.morganti`]: input,
                });
              }
            },
          },
        });
      }
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this.element.querySelectorAll("[data-action='takeRollable']").forEach(
        /** @param {HTMLElement} el */ (el) => {
          el.addEventListener("contextmenu", async (ev) => {
            await this._applyMorganti(ev, el);
          });
        },
      );
    }
  };
