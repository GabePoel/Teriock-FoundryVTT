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
      const archetypePanelParts = await archetype.getPanelParts();
      context.archetypePanel = await TeriockTextEditor.enrichPanel(archetypePanelParts, {
        relativeTo: this.document,
        secrets: this.document.isOwner ?? game.user.isGM,
      });
      context.archetype = getName(this.document.system.archetype).toLowerCase();
    }
    const ranks = (await Promise.all(Array.from(this.document.system.ranks).map(r => fromIdentifier(r)))).filter(
      Boolean,
    );
    if (ranks.length) {
      const rankPanelsParts = await Promise.all(ranks.map(r => r.getPanelParts()));
      for (const p of rankPanelsParts) { delete p.blocks; }
      context.rankPanels = await Promise.all(
        rankPanelsParts.map(p =>
          TeriockTextEditor.enrichPanel(p, {
            relativeTo: this.document,
            secrets: this.document.isOwner ?? game.user.isGM,
          })
        ),
      );
    }
    return context;
  }
}
