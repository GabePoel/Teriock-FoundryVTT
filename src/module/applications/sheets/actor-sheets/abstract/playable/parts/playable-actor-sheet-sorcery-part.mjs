import * as previews from "../../../../../../data/models/preview-models/_module.mjs";

/**
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetSorceryPart(Base) {
  /** @mixin */
  class PlayableActorSheetSorceryPart extends Base {
    /**
     * @this {PlayableActorSheetSorceryPart}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     * @category Sorcery
     */
    static async #previewGroupSorcery() {
      const rotators = this.document.system.rotatorDocuments;
      return [{
        docs: rotators,
        empty: _loc("TERIOCK.SHEETS.Actor.Sorcery.rotators").toLocaleLowerCase(game.i18n.lang),
        optional: true,
      }, {
        docs: this.document.previewed.getTypeSync("ability").filter(a =>
          a.system.spell && a.system.elderSorcery && !rotators.includes(a)
        ),
        empty: _loc("TERIOCK.SHEETS.Actor.Sorcery.spells").toLocaleLowerCase(game.i18n.lang),
        optional: true,
      }, {
        docs: this.document.previewed.getTypeSync("sorcery"),
        empty: _loc("TERIOCK.DOCUMENTS.Item.sorcery.plural").toLocaleLowerCase(game.i18n.lang),
      }];
    }

    /** @type {Record<string, HandlebarsTemplatePart & Teriock.Sheet._TemplatePart>} */
    static PARTS = {
      ...super.PARTS,
      sorcery: {
        scrollable: [""],
        template: "teriock/sheets/actors/tabs/sorcery-tab",
        teriock: { previews: ["sorcery"] },
      },
    };

    /** @type {Record<string, Teriock.Previews.PreviewConfig>} */
    static PREVIEWS = {
      ...super.PREVIEWS,
      sorcery: {
        addButton: {},
        data: { display: { gapless: true, size: "small" } },
        groups: this.#previewGroupSorcery,
        model: previews.MetaphysicsPreviewModel,
        types: ["sorcery"],
      },
    };

    /** @inheritDoc */
    async _preparePartContext(partId, context, options) {
      context = await super._preparePartContext(partId, context, options);
      if (partId !== "sorcery") { return context; }
      context.allWords = (await this.document.system.getAllWords()).renderHTML({ searchKey: this.id });
      return context;
    }
  }

  return PlayableActorSheetSorceryPart;
}
