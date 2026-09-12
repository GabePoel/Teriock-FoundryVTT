import { TeriockDragDrop } from "../../../../../ux/_module.mjs";

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, PlayableActorSheetTabsPart>}
 */
export default function PlayableActorSheetTabsPart(Base) {
  /** @mixin */
  class PlayableActorSheetTabsPart extends Base {
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
    async _onDragOver(event) {
      await super._onDragOver(event);
      if (event.dataTransfer.dropEffect === "none" || this._fieldDropTarget(event)) { return; }
      const droppedType = TeriockDragDrop.payload?.document?.type;
      const tabId = this.constructor.SECTIONS.find(section => (section.dragTypes ?? []).includes(droppedType))?.id;
      if (tabId) { this._revealDragTab(tabId, "primary"); }
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
