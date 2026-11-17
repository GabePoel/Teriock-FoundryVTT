import { fromIdentifier, getName } from "../../../utils/_module.mjs";
import BasePageSheet from "./base-page-sheet.mjs";

export default class ClassSheet extends BasePageSheet {
  /** @type {Record<string, HandlebarsTemplatePart>} */
  static VIEW_PARTS = { content: { template: "teriock/sheets/pages/class-view" } };

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    const archetype = await fromIdentifier(`archetype:${this.document.system.archetype}`);
    if (archetype) {
      const archetypePanel = await archetype?.toPanel();
      context.archetypePanel = await archetypePanel.prepareContext({
        bars: false,
        keepId: false,
        relativeTo: this.document,
        secrets: this.document.isOwner ?? game.user.isGM,
      });
      context.archetype = getName(`archetype:${this.document.system.archetype}`).toLocaleLowerCase(game.i18n.lang);
    }
    const ranks = (await Promise.all(Array.from(this.document.system.ranks).map(r => fromIdentifier(r)))).filter(
      Boolean,
    );
    if (ranks.length) {
      context.rankPanels = await Promise.all(ranks.map(async r => {
        const panel = await r?.toPanel();
        return panel.prepareContext({
          blocks: false,
          keepId: false,
          relativeTo: this.document,
          secrets: this.document.isOwner ?? game.user.isGM,
        });
      }));
    }
    return context;
  }
}
