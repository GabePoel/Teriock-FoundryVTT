import { TeriockDragDrop } from "../../../../../ux/_module.mjs";

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, PlayableActorSheetTabsPart>}
 */
export default function PlayableActorSheetTabsPart(Base) {
  /** @mixin */
  class PlayableActorSheetTabsPart extends Base {
    /** @type {string|null} */
    #tabBeforeDrag = null;

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
    async _onDragLeaveApplication() {
      await super._onDragLeaveApplication();
      if (this.#tabBeforeDrag) { this._safeChangeTab(this.#tabBeforeDrag, "primary"); }
      this.#tabBeforeDrag = null;
    }

    /** @inheritDoc */
    async _onDragOver(event) {
      await super._onDragOver(event);
      if (event.dataTransfer.dropEffect === "none" || this._fieldDropTarget(event)) { return; }
      const droppedType = TeriockDragDrop.payload?.document?.type;
      const tabId = this.constructor.SECTIONS.find(section => (section.dragTypes ?? []).includes(droppedType))?.id;
      if (!tabId || tabId === this.tabGroups.primary) { return; }
      this.#tabBeforeDrag ??= this.tabGroups.primary;
      this._safeChangeTab(tabId, "primary");
    }

    /** @inheritDoc */
    async _onDrop(event) {
      this.#tabBeforeDrag = null;
      await super._onDrop(event);
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
