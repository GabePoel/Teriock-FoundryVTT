import { toTitleCase } from "../../../../../helpers/string.mjs";
import { makeIconClass } from "../../../../../helpers/utils.mjs";
import { TeriockDialog } from "../../../../api/_module.mjs";

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
  class TakingActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        takeHack: this._onTakeHack,
        takeRollable: { buttons: [0, 2], handler: this._onTakeRollable },
      },
    };

    /**
     * Prompt for applying some amount of morganti damage or drain.
     * @param {string} type
     * @param {TeriockActor} actor
     * @returns {Promise<void>}
     */
    static async _applyMorganti(type, actor) {
      let stat;
      if (type === "damage") stat = "hp";
      if (type === "drain") stat = "mp";
      if (["damage", "drain"].includes(type)) {
        const field = new fields.NumberField({
          initial: actor.system[stat].morganti ?? 0,
          label: game.i18n.format(
            "TERIOCK.SHEETS.Actor.ACTIONS.ApplyMorganti.label",
            { effect: TERIOCK.options.impact[type]?.label },
          ),
          min: 0,
          integer: true,
          hint: game.i18n.format(
            "TERIOCK.SHEETS.Actor.ACTIONS.ApplyMorganti.hint",
            { effect: TERIOCK.options.impact[type]?.label?.toLowerCase() },
          ),
        });
        await TeriockDialog.prompt({
          window: {
            title: game.i18n.format(
              "TERIOCK.SHEETS.Actor.ACTIONS.ApplyMorganti.title",
              { effect: TERIOCK.options.impact[type]?.label },
            ),
            icon: makeIconClass(TERIOCK.options.impact[type].icon, "title"),
          },
          content: field.toFormGroup({}, { name: type }).outerHTML,
          ok: {
            label: game.i18n.localize(
              "TERIOCK.SHEETS.Actor.ACTIONS.ApplyMorganti.ok",
            ),
            callback: async (_event, button) => {
              let input = button.form.elements.namedItem(type).value;
              if (input) {
                await actor.update({
                  [`system.${stat}.morganti`]: input,
                });
              }
            },
          },
        });
      }
    }

    /**
     * Prompt for taking some amount of something and applying it to the actor.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async _onTakeRollable(event, target) {
      const type = target.dataset.type;
      if (event.button === 2) {
        await TakingActorSheetPart._applyMorganti(type, this.document);
        return;
      }
      const field = new fields.NumberField({
        label: toTitleCase(type),
        min: 0,
        integer: true,
        hint: game.i18n.format(
          "TERIOCK.SHEETS.Actor.ACTIONS.TakeRollable.hint",
          { effect: TERIOCK.options.impact[type]?.label?.toLowerCase() },
        ),
      });
      await TeriockDialog.prompt({
        window: {
          title: TERIOCK.options.impact[type]?.impact,
          icon: makeIconClass(TERIOCK.options.impact[type].icon, "title"),
        },
        content: field.toFormGroup({}, { name: type, placeholder: "0" })
          .outerHTML,
        ok: {
          label: game.i18n.localize(
            "TERIOCK.SHEETS.Actor.ACTIONS.TakeRollable.ok",
          ),
          callback: (_event, button) => {
            let input = button.form.elements.namedItem(type).value ?? "0";
            this.document.system[`take${toTitleCase(type)}`](Number(input));
          },
        },
      });
    }
  };
