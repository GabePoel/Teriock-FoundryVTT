import { TeriockDragDrop } from "../../../../../ux/_module.mjs";

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetTabsPart(Base) {
  /** @mixin */
  class PlayableActorSheetTabsPart extends Base {
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
      const tabId = this.constructor.SECTIONS.find(section => section.dragTypes?.includes(droppedType))?.id;
      if (this.constructor.TABS.primary.tabs.some(tab => tab.id === tabId)) { this._revealDragTab(tabId, "primary"); }
    }
  }

  return PlayableActorSheetTabsPart;
}
