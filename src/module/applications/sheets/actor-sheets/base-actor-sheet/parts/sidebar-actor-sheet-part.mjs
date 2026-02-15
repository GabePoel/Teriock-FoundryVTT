import { TeriockContextMenu } from "../../../../ux/_module.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * @param {typeof BaseActorSheet} Base
 */
export default (Base) =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class SidebarActorSheetPart extends Base {
    /** @inheritDoc */
    constructor(...args) {
      super(...args);
      this._sidebarOpen = true;
      this._tabberOpen = true;
      for (const stat of Object.keys(TERIOCK.options.die.stats)) {
        this[`_${stat}DrawerOpen`] = true;
      }
    }

    /**
     * Creates a context menu for selecting piercing type.
     * Provides options for none, AV0, and UB piercing types.
     * @returns {Teriock.Foundry.ContextMenuEntry[]}
     */
    #piercingContextMenu() {
      return TeriockContextMenu.makeUpdateEntries(
        this.actor,
        [
          { name: "None", icon: TERIOCK.display.icons.piercing.none, value: 0 },
          { name: "AV0", icon: TERIOCK.display.icons.piercing.av0, value: 1 },
          { name: "UB", icon: TERIOCK.display.icons.piercing.ub, value: 2 },
        ],
        {
          path: "system.offense.piercing.raw",
        },
      );
    }

    /**
     * Creates a context menu for selecting scaling type.
     * @returns {Teriock.Foundry.ContextMenuEntry[]}
     */
    #scalingContextMenu() {
      return TeriockContextMenu.makeUpdateEntries(
        this.actor,
        [
          {
            name: "Scale P and F off LVL",
            icon: TERIOCK.display.icons.document.rank,
            value: false,
          },
          {
            name: "Scale P and F off BR",
            icon: TERIOCK.display.icons.species.br,
            value: true,
          },
        ],
        {
          path: "system.scaling.brScale",
        },
      );
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);

      /** @type {Record<string, HTMLElement>} */
      const interactiveElements = {
        sidebar: this.element.querySelector(".character-sidebar"),
        tabber: this.element.querySelector(
          ".character-sidebar-tabber-container",
        ),
        hpDrawer: this.element.querySelector(".hp-die-drawer"),
        mpDrawer: this.element.querySelector(".mp-die-drawer"),
      };
      for (const [key, el] of Object.entries(interactiveElements)) {
        el?.classList.add("no-transition");
        el?.classList.toggle("collapsed", !this[`_${key}Open`]);
        //eslint-disable-next-line @typescript-eslint/no-unused-expressions
        el?.offsetHeight;
        el?.classList.remove("no-transition");
      }

      this.element
        .querySelectorAll(".character-tabber[data-tab='sidebar']")
        .forEach((el) => {
          el.addEventListener("click", async (e) => {
            e.preventDefault();
            interactiveElements.sidebar.classList.toggle("collapsed");
            interactiveElements.tabber.classList.toggle("collapsed");
            this._sidebarOpen = !this._sidebarOpen;
            this._tabberOpen = !this._tabberOpen;
            e.stopPropagation();
          });
        });

      for (const [stat, name] of Object.entries(TERIOCK.options.die.stats)) {
        this.element
          .querySelectorAll(`.character-${name}-bar-overlay-row`)
          .forEach((el) => {
            el.addEventListener("contextmenu", (e) => {
              e.preventDefault();
              interactiveElements[`${stat}Drawer`].classList.toggle(
                "collapsed",
              );
              this[`_${stat}DrawerOpen`] = !this[`_${stat}DrawerOpen`];
              e.stopPropagation();
            });
          });
      }

      this.element
        .querySelector(".character-penalty-box")
        ?.addEventListener("contextmenu", async (e) => {
          e.preventDefault();
          await this.document.update({ "system.combat.attackPenalty": 0 });
          e.stopPropagation();
        });

      this.element.querySelectorAll(".hack-marker-box").forEach((el) => {
        el.addEventListener("contextmenu", async (e) => {
          e.preventDefault();
          if (!(el instanceof HTMLElement)) {
            return;
          }
          const part =
            /** @type {Teriock.Parameters.Actor.HackableBodyPart} */ el.dataset
              .part;
          await this.actor.system.takeUnhack(part);
          e.stopPropagation();
        });
      });
      this._connectContextMenu(
        ".character-piercing-box",
        this.#piercingContextMenu(),
        "click",
      );
      this._connectContextMenu(
        ".character-basics",
        this.#scalingContextMenu(),
        "contextmenu",
        "down",
      );
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      return Object.assign(context, {
        sidebarOpen: this._sidebarOpen,
        takeStatButtons: true,
      });
    }
  };
