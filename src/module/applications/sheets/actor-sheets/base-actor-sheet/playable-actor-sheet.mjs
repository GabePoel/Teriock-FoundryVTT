/* eslint-disable @typescript-eslint/no-unused-expressions */
import { TeriockTextEditor } from "../../../ux/_module.mjs";
import TeriockBaseActorSheet from "./base-actor-sheet.mjs";
import CombatActorSheetPart from "./parts/combat-actor-sheet-part.mjs";
import MechanicalActorSheetPart from "./parts/mechanical-actor-sheet-part.mjs";
import RollingActorSheetPart from "./parts/rolling-actor-sheet-part.mjs";
import TakingActorSheetPart from "./parts/taking-actor-sheet-part.mjs";
import TradecraftsActorSheetPart from "./parts/tradecrafts-actor-sheet-part.mjs";
import {
  piercingContextMenu,
  scalingContextMenu,
} from "./tools/character-context-menus.mjs";

//noinspection JSUnresolvedReference,JSClosureCompilerSyntax
/**
 * @extends {TeriockBaseActorSheet}
 * @mixes CombatActorSheetPart
 * @mixes MechanicalActorSheetPart
 * @mixes RollingActorSheetPart
 * @mixes TakingActorSheetPart
 * @mixes TradecraftsActorSheetPart
 */
export default class TeriockPlayableActorSheet extends TradecraftsActorSheetPart(
  MechanicalActorSheetPart(
    RollingActorSheetPart(
      CombatActorSheetPart(TakingActorSheetPart(TeriockBaseActorSheet)),
    ),
  ),
) {
  /** @inheritDoc */
  constructor(...args) {
    super(...args);
    this._sidebarOpen = true;
    this._tabberOpen = true;
    for (const stat of Object.keys(TERIOCK.options.die.stats)) {
      this[`_${stat}DrawerOpen`] = true;
    }
  }

  /** @inheritDoc */
  async _onDrop(event) {
    const dropData = TeriockTextEditor.getDragEventData(event);
    const out = await super._onDrop(event);
    if (out) {
      if (["equipment", "body", "mount"].includes(dropData.systemType)) {
        this._activeTab = "inventory";
        await this.render();
      } else if (dropData.systemType === "fluency") {
        this._activeTab = "tradecrafts";
        await this.render();
      } else if (dropData.systemType === "rank") {
        this._activeTab = "classes";
        await this.render();
      } else if (["species", "power"].includes(dropData.systemType)) {
        this._activeTab = "powers";
        await this.render();
      } else if (dropData.systemType === "resource") {
        this._activeTab = "resources";
      } else if (
        ["attunement", "consequence", "condition", "base"].includes(
          dropData.systemType,
        )
      ) {
        this._activeTab = "conditions";
      }
    }
  }

  /** @inheritDoc */
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);
    if (this.document.species.length === 0) {
      ui.notifications.warn(
        `${this.document.name} has no species. Add one from the "Species" compendium.`,
      );
    }
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this._onRenderSidebar();
  }

  /**
   * Connect sidebar listeners.
   * @private
   */
  _onRenderSidebar() {
    /** @type {Record<string, HTMLElement} */
    const interactiveElements = {
      sidebar: this.element.querySelector(".character-sidebar"),
      tabber: this.element.querySelector(".character-sidebar-tabber-container"),
      hpDrawer: this.element.querySelector(".hp-die-drawer"),
      mpDrawer: this.element.querySelector(".mp-die-drawer"),
    };
    for (const [key, el] of Object.entries(interactiveElements)) {
      el?.classList.add("no-transition");
      el?.classList.toggle("collapsed", !this[`_${key}Open`]);
      el?.offsetHeight;
      el?.classList.remove("no-transition");
    }

    this.element.querySelectorAll(".character-tabber").forEach((el) => {
      el.addEventListener("click", async (e) => {
        e.preventDefault();
        /** @type {HTMLElement} */
        const currentTarget = e.currentTarget;
        const tab = /** @type {ActorTab} */ currentTarget.dataset.tab;
        if (tab === "sidebar") {
          interactiveElements.sidebar.classList.toggle("collapsed");
          interactiveElements.tabber.classList.toggle("collapsed");
          this._sidebarOpen = !this._sidebarOpen;
          this._tabberOpen = !this._tabberOpen;
        } else {
          this._activeTab = tab;
          await this.render();
        }
        e.stopPropagation();
      });
    });

    for (const [stat, name] of Object.entries(TERIOCK.options.die.stats)) {
      this.element
        .querySelectorAll(`.character-${name}-bar-overlay-row`)
        .forEach((el) => {
          el.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            interactiveElements[`${stat}Drawer`].classList.toggle("collapsed");
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
          /** @type {Teriock.Parameters.Actor.HackableBodyPart} */ el.dataset
            .part;
        await this.actor.system.takeUnhack(part);
        e.stopPropagation();
      });
    });
    this._connectContextMenu(
      ".character-piercing-box",
      piercingContextMenu(this.actor),
      "click",
    );
    this._connectContextMenu(
      ".character-basics",
      scalingContextMenu(this.actor),
      "contextmenu",
      "down",
    );
  }
}
