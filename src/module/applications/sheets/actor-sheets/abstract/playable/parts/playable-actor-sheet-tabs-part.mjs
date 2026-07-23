import { TeriockDragDrop } from "../../../../../ux/_module.mjs";

/**
 * @param {typeof BaseActorSheet} Base
 */
export default function PlayableActorSheetTabsPart(Base) {
  return (
    /**
     * @extends {BaseActorSheet}
     * @mixin
     */
    class PlayableActorSheetTabsPart extends Base {
      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = { actions: { changeTab: this._onChangeTab } };

      /**
       * Change tab.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       * @this {PlayableActorSheetTabsPart}
       */
      static async _onChangeTab(_event, target) {
        this._activeTab = target.dataset.tab;
        await this.render();
      }

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

      /** @type {string} */
      _activeTab = "tradecrafts";

      /** @inheritDoc */
      async _onDragLeaveApplication() {
        await super._onDragLeaveApplication();
        if (this.#tabBeforeDrag) { await this.setActiveTab(this.#tabBeforeDrag); }
        this.#tabBeforeDrag = null;
      }

      /** @inheritDoc */
      async _onDragOver(event) {
        await super._onDragOver(event);
        if (event.dataTransfer.dropEffect === "none" || this._fieldDropTarget(event)) { return; }
        const droppedType = TeriockDragDrop.payload?.document?.type;
        const tabId = this.constructor.SECTIONS.find(section => (section.dragTypes ?? []).includes(droppedType))?.id;
        if (!tabId || tabId === this._activeTab) { return; }
        this.#tabBeforeDrag ??= this._activeTab;
        await this.setActiveTab(tabId);
      }

      /** @inheritDoc */
      async _onDrop(event) {
        this.#tabBeforeDrag = null;
        await super._onDrop(event);
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        if (options.window?.detach || options.window?.attach) { this.#applyTabDirection(); }
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        return Object.assign(await super._prepareContext(options), {
          activeTab: this._activeTab,
          floatingTabs: game.settings.get("teriock", "floatingActorTabs"),
          tabDirection: this.#tabTooltipDirection,
        });
      }

      /**
       * Sets the active tab.
       * @param {string} tab - The tab ID to set as active.
       * @returns {Promise<void>}
       */
      async setActiveTab(tab) {
        this._activeTab = tab;
        await this.render();
      }
    }
  );
}
