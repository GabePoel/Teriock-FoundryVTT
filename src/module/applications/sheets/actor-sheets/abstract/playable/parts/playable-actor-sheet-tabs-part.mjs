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
      this.tabGroups.primary = null;
    }

    /** @returns {"LEFT"|"RIGHT"} */
    get #tabTooltipDirection() {
      return this.isDetached ? "LEFT" : "RIGHT";
    }

    /** Apply the current tab tooltip direction without a full re-render. */
    #applyTabDirection() {
      for (const el of this.element.querySelectorAll(".actor-tabber-background .actor-tabber-tooltip-container")) {
        el.dataset.tooltipDirection = this.#tabTooltipDirection;
      }
    }

    /** @inheritDoc */
    _getTabsConfig(group) {
      const config = super._getTabsConfig(group);
      if (group !== "primary") { return config; }
      const { childTypes } = this.document.metadata;
      const tabs = config.tabs.filter(tab => {
        const { dragTypes } = this.constructor.SECTIONS.find(section => section.id === tab.id);
        return !dragTypes || dragTypes.some(type => childTypes.includes(type));
      });
      const initial = game.settings.get("teriock", "defaultActorTab");
      return { ...config, initial: tabs.some(tab => tab.id === initial) ? initial : tabs[0].id, tabs };
    }

    /** @inheritDoc */
    async _onDragOver(event) {
      await super._onDragOver(event);
      if (event.dataTransfer.dropEffect === "none" || this._fieldDropTarget(event)) { return; }
      const droppedType = TeriockDragDrop.payload?.document?.type;
      const tabId = this.constructor.SECTIONS.find(section => (section.dragTypes ?? []).includes(droppedType))?.id;
      if (tabId && this.document.metadata.childTypes.includes(droppedType)) { this._revealDragTab(tabId, "primary"); }
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      return Object.assign(await super._prepareContext(options), {
        floatingTabs: game.settings.get("teriock", "floatingActorTabs"),
        tabDirection: this.#tabTooltipDirection,
      });
    }

    /** @inheritDoc */
    attachWindow(options = {}) {
      super.attachWindow(options);
      this.#applyTabDirection();
    }

    /** @inheritDoc */
    detachWindow(options = {}) {
      super.detachWindow(options);
      this.#applyTabDirection();
    }
  }

  return PlayableActorSheetTabsPart;
}
