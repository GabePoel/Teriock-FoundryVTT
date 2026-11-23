import * as previews from "../../../../../../data/models/preview-models/_module.mjs";

/**
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetAbilitiesPart(Base) {
  /** @mixin */
  class PlayableActorSheetAbilitiesPart extends Base {
    /**
     * @this {PlayableActorSheetAbilitiesPart}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     */
    static async #previewGroupAbility() {
      return [{
        docs: this.document.previewed.getTypeSync("ability").filter(a => !a.system.isBasic),
        empty: _loc("TERIOCK.SHEETS.Actor.Abilities.nonBasic"),
      }, { docs: game.teriock.basicAbilities, empty: _loc("TERIOCK.SHEETS.Actor.Abilities.basic"), sortable: false }];
    }

    /** @type {Record<string, HandlebarsTemplatePart & Teriock.Sheet._TemplatePart>} */
    static PARTS = {
      ...super.PARTS,
      abilities: {
        scrollable: [""],
        template: "teriock/sheets/actors/tabs/generic-tab",
        teriock: { previews: ["abilities"] },
      },
    };

    /** @type {Record<string, Teriock.Previews.PreviewConfig>} */
    static PREVIEWS = {
      ...super.PREVIEWS,
      abilities: {
        data: { display: { gapless: true, size: "small" } },
        groups: this.#previewGroupAbility,
        model: previews.AbilityPreviewModel,
      },
    };
  }

  return PlayableActorSheetAbilitiesPart;
}
