import * as previews from "../../../../../../data/models/preview-models/_module.mjs";

/**
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetInventoryPart(Base) {
  /** @mixin */
  class PlayableActorSheetInventoryPart extends Base {
    /**
     * @this {PlayableActorSheetInventoryPart}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     */
    static async #previewGroupEquipment() {
      return [{
        docs: this.document.previewed.getTypeSync("equipment").filter(e => !e?.sup || e.sup.type !== "equipment"),
        empty: _loc("TERIOCK.DOCUMENTS.Item.equipment.plural").toLocaleLowerCase(game.i18n.lang),
      }, {
        docs: this.document.previewed.getTypeSync("body"),
        empty: _loc("TERIOCK.DOCUMENTS.Item.body.plural").toLocaleLowerCase(game.i18n.lang),
        optional: !this.document.metadata.childTypes.includes("body"),
      }, {
        docs: this.document.previewed.getTypeSync("mount"),
        empty: _loc("TERIOCK.DOCUMENTS.Item.mount.plural").toLocaleLowerCase(game.i18n.lang),
        optional: !this.document.metadata.childTypes.includes("mount"),
      }];
    }

    /** @type {Record<string, HandlebarsTemplatePart & Teriock.Sheet._TemplatePart>} */
    static PARTS = {
      ...super.PARTS,
      inventory: {
        scrollable: [""],
        template: "teriock/sheets/actors/tabs/inventory-tab",
        teriock: { previews: ["inventory"] },
      },
    };

    /** @type {Record<string, Teriock.Previews.PreviewConfig>} */
    static PREVIEWS = {
      ...super.PREVIEWS,
      inventory: {
        addButton: { type: "equipment" },
        data: { display: { gapless: true, size: "small" } },
        groups: this.#previewGroupEquipment,
        model: previews.EquipmentPreviewModel,
        types: ["equipment", "body", "mount"],
      },
    };

    /** @inheritDoc */
    async _preparePartContext(partId, context, options) {
      context = await super._preparePartContext(partId, context, options);
      if (partId !== "inventory") { return context; }
      const { heavy, light, max } = this.document.system.carryingCapacity;
      context.carrying = {
        fill: Math.clamp(this.document.system.weight.carried / max, 0, 1) * 100,
        heavy: (heavy / max) * 100,
        level: [light, heavy, max].filter(c => this.document.system.weight.carried >= c).length,
        light: (light / max) * 100,
      };
      return context;
    }
  }

  return PlayableActorSheetInventoryPart;
}
