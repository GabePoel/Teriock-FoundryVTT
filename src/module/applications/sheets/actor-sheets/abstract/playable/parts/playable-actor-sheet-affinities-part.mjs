import * as previews from "../../../../../../data/models/preview-models/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/** @type {{ label: string, types: AffinityType[] }[]} */
const AFFINITY_GROUPS = Object.values(TERIOCK.CONFIG.affinity.groups);

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetAffinitiesPart(Base) {
  /** @mixin */
  class PlayableActorSheetAffinitiesPart extends Base {
    /**
     * Rolls an affinity.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     * @todo Fix the heck out of this. (This probably needs to happen within `BaseAffinity`.)
     */
    static async #onRollAffinity(event, target) {
      const affinity = await fromUuid(target.closest(".teriock-block")?.dataset.uuid);
      const type = affinity?.type ?? target.closest("[data-affinity-type]")?.dataset.affinityType;
      if (!type) { return; }
      await this.actor.run("resist", { affinity, event, type });
    }

    /**
     * A group for each kind of affinity.
     * @this {PlayableActorSheetAffinitiesPart}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     */
    static async #previewGroupAffinity() {
      return AFFINITY_GROUPS.map(group => ({
        docs: group.types.flatMap(t =>
          this.document.system.affinities.getTypeSync(t, { active: true, isPassive: true })
        ),
        empty: _loc(group.label).toLocaleLowerCase(game.i18n.lang),
        optional: true,
      }));
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = { actions: { rollAffinity: { buttons: [0, 2], handler: this.#onRollAffinity } } };

    /** @type {Record<string, HandlebarsTemplatePart & Teriock.Sheet._TemplatePart>} */
    static PARTS = {
      ...super.PARTS,
      affinities: {
        scrollable: [""],
        template: "teriock/sheets/actors/tabs/affinities-tab",
        teriock: { previews: ["affinities"] },
      },
    };

    /** @type {Record<string, Teriock.Previews.PreviewConfig>} */
    static PREVIEWS = {
      ...super.PREVIEWS,
      affinities: {
        data: { display: { gapless: false, size: "medium" } },
        groups: this.#previewGroupAffinity,
        model: previews.AffinityPreviewModel,
      },
    };

    /** @inheritDoc */
    async _preparePartContext(partId, context, options) {
      context = await super._preparePartContext(partId, context, options);
      if (partId !== "affinities") { return context; }
      context.affinityButtons = Object.entries(TERIOCK.CONFIG.affinity.types).filter(([, type]) => type.button).map((
        [key, type],
      ) => ({ affinityType: key, img: type.img, label: type.label, tooltip: type.button }));
      return context;
    }
  }

  return PlayableActorSheetAffinitiesPart;
}
