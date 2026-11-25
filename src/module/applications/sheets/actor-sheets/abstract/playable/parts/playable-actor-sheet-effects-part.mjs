import { toId } from "../../../../../../utils/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 * @import * as hookEvents from "@client/hooks.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetEffectsPart(Base) {
  /** @mixin */
  class PlayableActorSheetEffectsPart extends Base {
    /**
     * Toggles a condition.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onToggleCondition(event, target) {
      if (event.button === 2) {
        const document = await teriock.fromIdentifier(`condition:${target.dataset.condition}`);
        await document?.sheet.render(true);
      }
      if (event.button === 0) {
        if (!game.teriock.checkEditable(this)) { return; }
        await this.document.toggleStatusEffect(target.dataset.condition);
      }
    }

    /**
     * @this {PlayableActorSheetEffectsPart}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     */
    static async #previewGroupConsequence() {
      return [{
        docs: this.document.previewed.getTypeSync("consequence"),
        empty: _loc("TERIOCK.DOCUMENTS.ActiveEffect.consequence.plural").toLocaleLowerCase(game.i18n.lang),
      }, {
        docs: this.document.previewed.getTypeSync("imbuement"),
        empty: _loc("TERIOCK.DOCUMENTS.ActiveEffect.imbuement.plural").toLocaleLowerCase(game.i18n.lang),
        optional: true,
      }, {
        docs: this.document.previewed.getTypeSync("holiday"),
        empty: _loc("TERIOCK.DOCUMENTS.ActiveEffect.holiday.plural").toLocaleLowerCase(game.i18n.lang),
        optional: true,
      }, {
        docs: this.document.previewed.getTypeSync("attunement"),
        empty: _loc("TERIOCK.DOCUMENTS.ActiveEffect.attunement.plural").toLocaleLowerCase(game.i18n.lang),
        optional: !this.document.metadata.childTypes.includes("attunement"),
      }, {
        docs: this.document.effects.filter(e => ["base", "condition", "cover", "hack"].includes(e.type) && !e.isStatus),
        empty: _loc("TERIOCK.DOCUMENTS.ActiveEffect.effect.plural").toLocaleLowerCase(game.i18n.lang),
        optional: true,
      }, {
        docs: this.document.system.virtualConditions.contents,
        empty: _loc("TERIOCK.DOCUMENTS.ActiveEffect.condition.plural").toLocaleLowerCase(game.i18n.lang),
      }];
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = { actions: { toggleCondition: { buttons: [0, 2], handler: this.#onToggleCondition } } };

    /** @type {Record<string, HandlebarsTemplatePart & Teriock.Sheet._TemplatePart>} */
    static PARTS = {
      ...super.PARTS,
      effects: {
        scrollable: [""],
        template: "teriock/sheets/actors/tabs/effects-tab",
        teriock: { previews: ["effects"] },
      },
    };

    /** @type {Record<string, Teriock.Previews.PreviewConfig>} */
    static PREVIEWS = {
      ...super.PREVIEWS,
      effects: {
        addButton: { type: "consequence", types: ["consequence", "holiday", "attunement"] },
        data: { display: { gapless: true, size: "small" } },
        groups: this.#previewGroupConsequence,
        types: ["attunement", "condition", "consequence", "cover", "hack", "holiday"],
      },
    };

    /** @inheritDoc */
    async _preparePartContext(partId, context, options) {
      context = await super._preparePartContext(partId, context, options);
      if (partId !== "effects") { return context; }
      context.conditions = {};
      for (const key of Object.keys(TERIOCK.STATUSES.conditions)) {
        context.conditions[key] = Boolean(this.document.effects.get(toId(key))?.isStatus);
      }
      return context;
    }
  }

  return PlayableActorSheetEffectsPart;
}

/**
 * Re-render sheets to show updated effect durations.
 * @see {@link hookEvents.updateWorldTime}
 */
async function refreshEffectDurations() {
  for (const app of foundry.applications.sheets.ActorSheetV2.instances()) {
    if (app.document.previewedTags.applicable.filter(a => a.isTemporary).length) { app.render({ parts: ["effects"] }); }
  }
}
Hooks.on("updateWorldTime", refreshEffectDurations);
