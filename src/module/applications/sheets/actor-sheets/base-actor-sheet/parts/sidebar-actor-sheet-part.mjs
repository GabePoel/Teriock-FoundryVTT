/* eslint-disable @typescript-eslint/no-unused-expressions */
/**
 * @param {typeof TeriockBaseActorSheet} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockBaseActorSheet}
     * @mixin
     * @property {TeriockActor} document
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
        return [
          {
            name: "None",
            icon: '<i class="fa-solid fa-xmark"></i>',
            callback: async () => {
              await this.actor.update({
                "system.offense.piercing": "none",
              });
            },
          },
          {
            name: "AV0",
            icon: '<i class="fa-solid fa-a"></i>',
            callback: async () => {
              await this.actor.update({
                "system.offense.piercing": "av0",
              });
            },
          },
          {
            name: "UB",
            icon: '<i class="fa-solid fa-u"></i>',
            callback: async () => {
              await this.actor.update({
                "system.offense.piercing": "ub",
              });
            },
          },
        ];
      }

      /**
       * Creates a context menu for selecting scaling type.
       * @returns {Teriock.Foundry.ContextMenuEntry[]}
       */
      #scalingContextMenu() {
        return [
          {
            name: "Scale P and F off LVL",
            icon: '<i class="fa-solid fa-wreath-laurel"></i>',
            callback: async () => {
              await this.actor.update({
                "system.scaling.brScale": false,
              });
            },
          },
          {
            name: "Scale P and F off BR",
            icon: '<i class="fa-solid fa-swords"></i>',
            callback: async () => {
              await this.actor.update({
                "system.scaling.brScale": true,
              });
            },
          },
        ];
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
          .querySelectorAll("[data-action='quickToggle']")
          .forEach((el) => {
            el.addEventListener("contextmenu", async (e) => {
              e.preventDefault();
              if (!(el instanceof HTMLElement)) {
                return;
              }
              const path = el.dataset.path.replace("proficient", "fluent");
              const current = foundry.utils.getProperty(this.document, path);
              await this.document.update({
                [path]: !current,
              });
              e.stopPropagation();
            });
          });

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
              /** @type {Teriock.Parameters.Actor.HackableBodyPart} */ el
                .dataset.part;
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

      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        context.sidebarOpen = this._sidebarOpen;
        return context;
      }
    }
  );
};
