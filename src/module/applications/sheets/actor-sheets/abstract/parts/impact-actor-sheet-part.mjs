import { makeIconClass } from "../../../../../helpers/icon.mjs";
import { TeriockDialog } from "../../../../api/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof BaseActorSheet} Base
 */
export default Base =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class ImpactActorSheetPart extends Base {
    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: { takeHack: this._onTakeHack, takeImpact: { buttons: [0, 2], handler: this._onTakeImpact } },
    };

    /**
     * Prompt for applying some amount of morganti damage or drain.
     * @param {Teriock.Keys.Impact} impact
     * @param {TeriockActor} actor
     * @returns {Promise<void>}
     */
    static async _applyMorganti(impact, actor) {
      if (TERIOCK.config.impact[impact]?.morganti) {
        const cost = Object.entries(TERIOCK.config.cost.primary.keys).find(([_k, v]) => v.impact === impact);
        const stat = cost ? cost[0] : null;
        if (!stat) { return; }
        const field = new fields.NumberField({
          hint: _loc("TERIOCK.SHEETS.Actor.ACTIONS.ApplyMorganti.hint", {
            effect: TERIOCK.config.impact[impact]?.label?.toLowerCase(),
          }),
          initial: actor.system[stat].morganti ?? 0,
          integer: true,
          label: _loc("TERIOCK.SHEETS.Actor.ACTIONS.ApplyMorganti.label", {
            effect: TERIOCK.config.impact[impact]?.label,
          }),
          min: 0,
          placeholder: "0",
        });
        await TeriockDialog.prompt({
          content: field.toFormGroup({}, { name: impact }).outerHTML,
          ok: {
            label: _loc("TERIOCK.SHEETS.Actor.ACTIONS.ApplyMorganti.ok"),
            callback: async (_event, button) => {
              const input = button.form.elements.namedItem(impact).value ?? 0;
              await actor.update({ [`system.${stat}.morganti`]: input });
            },
          },
          window: {
            icon: makeIconClass(TERIOCK.config.impact[impact].icon, "title"),
            title: _loc("TERIOCK.SHEETS.Actor.ACTIONS.ApplyMorganti.title", {
              effect: TERIOCK.config.impact[impact]?.label,
            }),
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
    static async _onTakeImpact(event, target) {
      const impact = target.dataset.impact;
      if (event.button === 2) {
        await ImpactActorSheetPart._applyMorganti(impact, this.document);
        return;
      }
      await this.document.system.impactDialog(impact);
    }
  };
