import { TeriockContextMenu } from "../../../../ux/_module.mjs";

/**
 * @param {typeof BaseActorSheet} Base
 */
export default Base =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class SidebarActorSheetPart extends Base {
    /**
     * Reset attack penalty to zero.
     * @returns {Promise<void>}
     */
    static async #onResetAttackPenalty() {
      await this.document.update({ "system.combat.attackPenalty": 0 });
    }

    /**
     * Toggle the sidebar's collapsed state.
     * @returns {Promise<void>}
     */
    static async #onToggleSidebar() {
      this.element.querySelectorAll(".sidebar-collapser").forEach(el => el.classList.toggle("collapsed"));
      this._sidebarOpen = !this._sidebarOpen;
    }

    /**
     * Toggle a stat drawer's collapsed state.
     * @param {PointerEvent} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     */
    static async #onToggleStatDrawer(_event, target) {
      target
        .closest(".character-status-bar-box")
        ?.querySelector(".die-drawer:not(.top-drawer)")
        ?.classList.toggle("collapsed");
      const stat = target.dataset.stat;
      this[`_${stat}DrawerOpen`] = !this[`_${stat}DrawerOpen`];
    }

    static DEFAULT_OPTIONS = {
      actions: {
        resetAttackPenalty: {
          buttons: [2],
          handler: this.#onResetAttackPenalty,
        },
        toggleSidebar: this.#onToggleSidebar,
        toggleStatDrawer: {
          buttons: [2],
          handler: this.#onToggleStatDrawer,
        },
      },
    };

    /** @inheritDoc */
    constructor(...args) {
      super(...args);
      this._sidebarOpen = true;
      for (const stat of Object.keys(TERIOCK.config.die.stats)) {
        this[`_${stat}DrawerOpen`] = true;
      }
    }

    /**
     * Creates a context menu for selecting piercing type.
     * Provides options for none, AV0, and UB piercing types.
     * @returns {ContextMenuEntry[]}
     */
    #piercingContextMenu() {
      return TeriockContextMenu.makeUpdateEntries(
        this.actor,
        [
          {
            label: _loc("TERIOCK.MODELS.Piercing.MENU.0"),
            icon: TERIOCK.display.icons.piercing.none,
            value: 0,
          },
          {
            label: _loc("TERIOCK.MODELS.Piercing.MENU.1"),
            icon: TERIOCK.display.icons.piercing.av0,
            value: 1,
          },
          {
            label: _loc("TERIOCK.MODELS.Piercing.MENU.2"),
            icon: TERIOCK.display.icons.piercing.ub,
            value: 2,
          },
        ],
        {
          path: "system.offense.piercing.raw",
        },
      );
    }

    /**
     * Creates a context menu for selecting scaling type.
     * @returns {ContextMenuEntry[]}
     */
    #scalingContextMenu() {
      return TeriockContextMenu.makeUpdateEntries(
        this.actor,
        [
          {
            label: _loc("TERIOCK.SHEETS.Actor.SIDEBAR.Scaling.type.lvl"),
            icon: TERIOCK.display.icons.document.rank,
            value: false,
          },
          {
            label: _loc("TERIOCK.SHEETS.Actor.SIDEBAR.Scaling.type.br"),
            icon: TERIOCK.display.icons.species.br,
            value: true,
          },
        ],
        { path: "system.scaling.brScale" },
      );
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);

      this._connectContextMenu(".character-piercing-box", this.#piercingContextMenu(), "click");
      this._connectContextMenu(".character-basics", this.#scalingContextMenu(), "contextmenu", "down");
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      for (const stat of Object.keys(TERIOCK.config.die.stats)) {
        context[`${stat}DrawerCollapsed`] = !this[`_${stat}DrawerOpen`];
      }
      return Object.assign(context, {
        sidebarOpen: this._sidebarOpen,
        takeStatButtons: true,
      });
    }
  };
