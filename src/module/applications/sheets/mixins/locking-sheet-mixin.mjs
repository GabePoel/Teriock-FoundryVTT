/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, LockingSheet>}
 */
export default function LockingSheetMixin(Base) {
  /**
   * @mixin
   * @property {TeriockActiveEffect|TeriockActor|TeriockItem} document
   */
  class LockingSheet extends Base {
    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = { actions: { toggleLockThis: this._onToggleLockThis }, teriock: { startLocked: null } };

    /**
     * Toggles the lock state of the current sheet.
     * @returns {Promise<void>}
     * @this {LockingSheet}
     */
    static async _onToggleLockThis() {
      this.#locked = !this.#locked;
      await this.render();
      game.tooltip.reactivate();
    }

    constructor(...args) {
      super(...args);
      this.#locked = this.options?.teriock?.startLocked ?? !game.settings.get("teriock", "unlockSheetsByDefault");
    }

    /** @type {boolean} */
    #locked = false;

    /** @returns {string} */
    get #lockIcon() {
      return this.isEditable ? "fa-lock-open" : "fa-lock";
    }

    /** @returns {string} */
    get #lockLabel() {
      return this.isEditable ? "SIDEBAR.PLACEABLES.ACTIONS.Unlocked" : "SIDEBAR.PLACEABLES.ACTIONS.Locked";
    }

    /**
     * @param {HTMLButtonElement} toggleButton
     */
    #setToggleLockButtonAttributes(toggleButton) {
      toggleButton.classList.remove(...["fa-lock-open", "fa-lock"]);
      toggleButton.classList.add(this.#lockIcon);
      toggleButton.ariaLabel = _loc(this.#lockLabel);
      toggleButton.disabled = !this.document.isOwner || (this.document.inCompendium && this.document.compendium.locked);
    }

    /** @inheritDoc */
    get isEditable() {
      return super.isEditable && !this.#locked;
    }

    /** @inheritDoc */
    _getFrameButtons(options) {
      return [
        { action: "toggleLockThis", icon: `fa-solid ${this.#lockIcon}`, label: this.#lockLabel },
        ...super._getFrameButtons(options),
      ];
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      const toggleButton = this.window.header?.querySelector("[data-action='toggleLockThis']");
      if (toggleButton) { this.#setToggleLockButtonAttributes(toggleButton); }
      this.element.querySelectorAll("button[data-action='rollTable']").forEach((btn) => btn.disabled = false);
    }
  }

  return LockingSheet;
}
