import { toCamelCase, toTitleCase } from "../../../../../helpers/string.mjs";
import { makeIconClass } from "../../../../../helpers/utils.mjs";
import { TeriockDialog } from "../../../../api/_module.mjs";
import { HackStatMixin } from "../../../../shared/mixins/_module.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * @param {typeof BaseActorSheet} Base
 */
export default (Base) =>
  /**
   * @extends {BaseActorSheet}
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
        hint: game.i18n.format(
          "TERIOCK.SHEETS.Actor.ACTIONS.TakeRollable.hint",
          { effect: TERIOCK.options.take[type]?.label?.toLowerCase() },
        ),
      });
      await TeriockDialog.prompt({
        window: {
          title: TERIOCK.options.take[type]?.take,
          icon: makeIconClass(TERIOCK.options.take[type].icon, "title"),
        },
        content: field.toFormGroup({}, { name: type }).outerHTML,
        ok: {
          label: game.i18n.localize(
            "TERIOCK.SHEETS.Actor.ACTIONS.TakeRollable.ok",
          ),
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
          label: game.i18n.format(
            "TERIOCK.SHEETS.Actor.ACTIONS.ApplyMorganti.label",
            { effect: TERIOCK.options.take[type]?.label },
          ),
          min: 0,
          integer: true,
          hint: game.i18n.format(
            "TERIOCK.SHEETS.Actor.ACTIONS.ApplyMorganti.hint",
            { effect: TERIOCK.options.take[type]?.label?.toLowerCase() },
          ),
        });
        await TeriockDialog.prompt({
          window: {
            title: game.i18n.format(
              "TERIOCK.SHEETS.Actor.ACTIONS.ApplyMorganti.title",
              { effect: TERIOCK.options.take[type]?.label },
            ),
            icon: makeIconClass(TERIOCK.options.take[type].icon, "title"),
          },
          content: field.toFormGroup({}, { name: type }).outerHTML,
          ok: {
            label: game.i18n.localize(
              "TERIOCK.SHEETS.Actor.ACTIONS.ApplyMorganti.ok",
            ),
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
