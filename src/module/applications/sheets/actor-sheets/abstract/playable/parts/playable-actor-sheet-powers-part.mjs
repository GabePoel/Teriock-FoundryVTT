import * as previews from "../../../../../../data/models/preview-models/_module.mjs";
import { getSystemClass } from "../../../../../../utils/_module.mjs";

/**
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetPowersPart(Base) {
  /** @mixin */
  class PlayableActorSheetPowersPart extends Base {
    /**
     * @this {PlayableActorSheetPowersPart}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     */
    static async #previewGroupPower() {
      return [
        {
          docs: this.document.previewed.getTypeSync("species"),
          empty: _loc("TERIOCK.DOCUMENTS.Item.species.plural").toLocaleLowerCase(game.i18n.lang),
          optional: !this.document.metadata.childTypes.includes("species"),
        },
        {
          docs: this.document.previewed.getTypeSync("power"),
          empty: _loc("TERIOCK.DOCUMENTS.Item.power.plural").toLocaleLowerCase(game.i18n.lang),
        },
        ...Item.implementation.TYPES.filter(t =>
          !["power", "sorcery"].includes(t) && getSystemClass(t)?.metadata.tags.simple
        ).map(t => ({
          docs: this.document.previewed.getTypeSync(t),
          empty: _loc(`TERIOCK.DOCUMENTS.Item.${t}.plural`).toLocaleLowerCase(game.i18n.lang),
          optional: true,
        })),
      ];
    }

    /** @type {Record<string, HandlebarsTemplatePart & Teriock.Sheet._TemplatePart>} */
    static PARTS = {
      ...super.PARTS,
      powers: {
        scrollable: [""],
        template: "teriock/sheets/actors/tabs/generic-tab",
        teriock: { previews: ["powers"] },
      },
    };

    /** @type {Record<string, Teriock.Previews.PreviewConfig>} */
    static PREVIEWS = {
      ...super.PREVIEWS,
      powers: {
        addButton: { type: "power" },
        groups: this.#previewGroupPower,
        model: previews.PowerPreviewModel,
        types: ["power", "species", "backstory", "blessing", "curse", "familiar", "pact", "scar"],
      },
    };
  }

  return PlayableActorSheetPowersPart;
}
