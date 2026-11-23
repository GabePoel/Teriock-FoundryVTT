import { TeriockDragDrop } from "../../../../../ux/_module.mjs";

/**
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetTabsPart(Base) {
  /** @mixin */
  class PlayableActorSheetTabsPart extends Base {
    /** @type {Record<string, HandlebarsTemplatePart & Teriock.Sheet._TemplatePart>} */
    static PARTS = { ...super.PARTS, tabs: { template: "teriock/ui/vertical-tabs" } };

    constructor(...args) {
      super(...args);
      const initial = game.settings.get("teriock", "defaultActorTab");
      if (this.constructor.TABS.primary.tabs.some(tab => tab.id === initial)) { this.tabGroups.primary = initial; }
    }

    /** @inheritDoc */
    async _onDragOver(event) {
      await super._onDragOver(event);
      if (event.dataTransfer.dropEffect === "none" || this._fieldDropTarget(event)) { return; }
      const droppedType = TeriockDragDrop.payload?.document?.type;
      const { PARTS, PREVIEWS, TABS } = this.constructor;
      const tab = TABS.primary.tabs.find(({ id }) =>
        (PARTS[id]?.teriock?.previews ?? []).some(preview => PREVIEWS[preview]?.types?.includes(droppedType))
      );
      if (tab) { this._revealDragTab(tab.id, "primary"); }
    }
  }

  return PlayableActorSheetTabsPart;
}
