import * as previews from "../../../../../../data/models/preview-models/_module.mjs";

/**
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetClassesPart(Base) {
  /** @mixin */
  class PlayableActorSheetClassesPart extends Base {
    /**
     * @this {PlayableActorSheetClassesPart}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     */
    static async #previewGroupRank() {
      return [{
        docs: this.document.previewed.getTypeSync("rank"),
        empty: _loc("TERIOCK.DOCUMENTS.Item.rank.plural").toLocaleLowerCase(game.i18n.lang),
      }, {
        docs: this.document.previewed.getTypeSync("archetype"),
        empty: _loc("TERIOCK.DOCUMENTS.Item.archetype.plural").toLocaleLowerCase(game.i18n.lang),
        optional: true,
      }];
    }

    /** @type {Record<string, HandlebarsTemplatePart & Teriock.Sheet._TemplatePart>} */
    static PARTS = {
      ...super.PARTS,
      classes: {
        scrollable: [""],
        template: "teriock/sheets/actors/tabs/generic-tab",
        teriock: { previews: ["classes"] },
      },
    };

    /** @type {Record<string, Teriock.Previews.PreviewConfig>} */
    static PREVIEWS = {
      ...super.PREVIEWS,
      classes: {
        addButton: { types: ["rank"] },
        groups: this.#previewGroupRank,
        model: previews.RankPreviewModel,
        types: ["rank", "archetype"],
      },
    };
  }

  return PlayableActorSheetClassesPart;
}
