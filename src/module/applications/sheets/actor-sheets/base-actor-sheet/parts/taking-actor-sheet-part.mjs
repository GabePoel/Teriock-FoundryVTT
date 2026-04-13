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
          label: _loc("TERIOCK.SHEETS.Actor.ACTIONS.ApplyMorganti.label", {
            effect: TERIOCK.options.impact[type]?.label,
          }),
          min: 0,
          integer: true,
          hint: _loc("TERIOCK.SHEETS.Actor.ACTIONS.ApplyMorganti.hint", {
            effect: TERIOCK.options.impact[type]?.label?.toLowerCase(),
          }),
        });
        await TeriockDialog.prompt({
          window: {
            title: _loc("TERIOCK.SHEETS.Actor.ACTIONS.ApplyMorganti.title", {
              effect: TERIOCK.options.impact[type]?.label,
            }),
            icon: makeIconClass(TERIOCK.options.impact[type].icon, "title"),
          },
          content: field.toFormGroup({}, { name: type }).outerHTML,
          ok: {
            label: _loc("TERIOCK.SHEETS.Actor.ACTIONS.ApplyMorganti.ok"),
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
      const impact = target.dataset.impact;
      if (event.button === 2) {
        await TakingActorSheetPart._applyMorganti(impact, this.document);
        return;
      }
      const field = new fields.NumberField({
        label: toTitleCase(impact),
        min: 0,
        integer: true,
        hint: _loc("TERIOCK.SHEETS.Actor.ACTIONS.TakeRollable.hint", {
          effect: TERIOCK.options.impact[impact]?.label?.toLowerCase(),
        }),
      });
      await TeriockDialog.prompt({
        window: {
          title: TERIOCK.options.impact[impact]?.label,
          icon: makeIconClass(TERIOCK.options.impact[impact].icon, "title"),
        },
        content: field.toFormGroup({}, { name: impact, placeholder: "0" })
          .outerHTML,
        ok: {
          label: _loc("TERIOCK.SHEETS.Actor.ACTIONS.TakeRollable.ok"),
          callback: (_event, button) => {
            let input = button.form.elements.namedItem(impact).value ?? "0";
            this.document.system[`take${toTitleCase(impact)}`](Number(input));
          },
        },
      });
    }
  };
