import { fromIdentifier, getName } from "../../../helpers/utils.mjs";
import { TeriockTextEditor } from "../../ux/_module.mjs";
import BasePageSheet from "./base-page-sheet.mjs";

export default class ClassSheet extends BasePageSheet {
  /** @type {Record<string, HandlebarsTemplatePart>} */
  static VIEW_PARTS = { content: { template: "teriock/sheets/pages/class-view" } };

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    context.instructions = await TeriockTextEditor.enrichHTML(this.document.system.instructions, {
      relativeTo: this.document,
    });
    const archetype = await fromIdentifier(this.document.system.archetype);
    if (archetype) {
      const archetypePanel = await archetype?.toPanel();
      context.archetypePanel = await archetypePanel.prepareContext({
        keepId: false,
        noBars: true,
        relativeTo: this.document,
        secrets: this.document.isOwner ?? game.user.isGM,
      });
      context.archetype = getName(this.document.system.archetype).toLowerCase();
    }
    const ranks = (await Promise.all(Array.from(this.document.system.ranks).map(r => fromIdentifier(r)))).filter(
      Boolean,
    );
    if (ranks.length) {
      context.rankPanels = await Promise.all(ranks.map(async r => {
        const panel = await r?.toPanel();
        return panel.prepareContext({
          keepId: false,
          noBlocks: true,
          relativeTo: this.document,
          secrets: this.document.isOwner ?? game.user.isGM,
        });
      }));
    }
    return context;
  }
}
