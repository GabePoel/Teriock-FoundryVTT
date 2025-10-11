/* eslint-disable @typescript-eslint/no-unused-expressions */
import TeriockBaseActorSheet from "./base-actor-sheet.mjs";
import CombatActorSheetPart from "./parts/combat-actor-sheet-part.mjs";
import MechanicalActorSheetPart from "./parts/mechanical-actor-sheet-part.mjs";
import RollingActorSheetPart from "./parts/rolling-actor-sheet-part.mjs";
import TakingActorSheetPart from "./parts/taking-actor-sheet-part.mjs";
import TradecraftsActorSheetPart from "./parts/tradecrafts-actor-sheet-part.mjs";
import { piercingContextMenu } from "./tools/character-context-menus.mjs";

//noinspection JSUnresolvedReference,JSClosureCompilerSyntax
/**
 * @extends TeriockBaseActorSheet
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
    this._hpDrawerOpen = true;
    this._mpDrawerOpen = true;
  }

  /** @inheritDoc */
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);
    if (this.document.species.length === 0) {
      foundry.ui.notifications.warn(
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
    /** @type {HTMLDivElement} */
    const sidebar = this.element.querySelector(".character-sidebar");
    /** @type {HTMLDivElement} */
    const tabber = this.element.querySelector(
      ".character-sidebar-tabber-container",
    );
    /** @type {HTMLDivElement} */
    const hpDrawer = this.element.querySelector(".hp-die-drawer");
    /** @type {HTMLDivElement} */
    const mpDrawer = this.element.querySelector(".mp-die-drawer");

    sidebar?.classList.add("no-transition");
    tabber?.classList.add("no-transition");
    hpDrawer?.classList.add("no-transition");
    mpDrawer?.classList.add("no-transition");

    sidebar?.classList.toggle("collapsed", !this._sidebarOpen);
    tabber?.classList.toggle("collapsed", !this._sidebarOpen);
    hpDrawer?.classList.toggle("closed", !this._hpDrawerOpen);
    mpDrawer?.classList.toggle("closed", !this._mpDrawerOpen);

    sidebar?.offsetHeight;
    tabber?.offsetHeight;
    hpDrawer?.offsetHeight;
    mpDrawer?.offsetHeight;

    sidebar?.classList.remove("no-transition");
    tabber?.classList.remove("no-transition");
    hpDrawer?.classList.remove("no-transition");
    mpDrawer?.classList.remove("no-transition");

    this.element.querySelectorAll(".character-tabber").forEach((el) => {
      el.addEventListener("click", async (e) => {
        e.preventDefault();
        /** @type {HTMLElement} */
        const currentTarget = e.currentTarget;
        const tab = currentTarget.dataset.tab;
        if (tab === "sidebar") {
          sidebar.classList.toggle("collapsed");
          tabber.classList.toggle("collapsed");
          this._sidebarOpen = !this._sidebarOpen;
        } else {
          this._activeTab = tab;
          await this.render();
        }
        e.stopPropagation();
      });
    });

    this.element
      .querySelectorAll(".character-hit-bar-overlay-row")
      .forEach((el) => {
        el.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          hpDrawer.classList.toggle("closed");
          this._hpDrawerOpen = !this._hpDrawerOpen;
          e.stopPropagation();
        });
      });

    this.element
      .querySelectorAll(".character-mana-bar-overlay-row")
      .forEach((el) => {
        el.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          mpDrawer.classList.toggle("closed");
          this._mpDrawerOpen = !this._mpDrawerOpen;
          e.stopPropagation();
        });
      });

    this.element.querySelectorAll(".ch-attribute-save-box").forEach((el) => {
      el.addEventListener("contextmenu", async (e) => {
        e.preventDefault();
        if (!(el instanceof HTMLElement)) {
          return;
        }
        const attr = el.dataset.attribute;
        const current = this.document.system.attributes[attr].saveFluent;
        await this.document.update({
          [`system.attributes.${attr}.saveFluent`]: !current,
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

    this.element
      .querySelector(".character-name")
      ?.addEventListener("contextmenu", async (e) => {
        e.preventDefault();
        console.log("Debug", this.document, this);
        e.stopPropagation();
      });

    this._connectContextMenu(
      ".character-piercing-box",
      piercingContextMenu(this.actor),
      "click",
    );
  }
}
