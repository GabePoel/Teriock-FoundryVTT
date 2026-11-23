import * as previews from "../../../../../../data/models/preview-models/_module.mjs";

/**
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetResourcesPart(Base) {
  /** @mixin */
  class PlayableActorSheetResourcesPart extends Base {
    /**
     * @this {PlayableActorSheetResourcesPart}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     */
    static async #previewGroupResource() {
      const consumable = "TERIOCK.SHEETS.Actor.Resources.consumable";
      return [{
        docs: this.document.previewed.getTypeSync("resource"),
        empty: _loc("TERIOCK.DOCUMENTS.ActiveEffect.resource.plural").toLocaleLowerCase(game.i18n.lang),
      }, {
        docs: this.document.previewed.getTypeSync("ability").filter(a => a.system.consumption.enabled),
        empty: _loc(consumable, {
          value: _loc("TERIOCK.DOCUMENTS.ActiveEffect.ability.plural").toLocaleLowerCase(game.i18n.lang),
        }),
      }, {
        docs: this.document.previewed.getTypeSync("property").filter(p => p.system.consumption.enabled),
        empty: _loc(consumable, {
          value: _loc("TERIOCK.DOCUMENTS.ActiveEffect.property.plural").toLocaleLowerCase(game.i18n.lang),
        }),
      }];
    }

    /** @type {Record<string, HandlebarsTemplatePart & Teriock.Sheet._TemplatePart>} */
    static PARTS = {
      ...super.PARTS,
      resources: {
        scrollable: [""],
        template: "teriock/sheets/actors/tabs/generic-tab",
        teriock: { previews: ["resources"] },
      },
    };

    /** @type {Record<string, Teriock.Previews.PreviewConfig>} */
    static PREVIEWS = {
      ...super.PREVIEWS,
      resources: {
        addButton: {},
        groups: this.#previewGroupResource,
        model: previews.MetaphysicsPreviewModel,
        types: ["resource"],
      },
    };
  }

  return PlayableActorSheetResourcesPart;
}
