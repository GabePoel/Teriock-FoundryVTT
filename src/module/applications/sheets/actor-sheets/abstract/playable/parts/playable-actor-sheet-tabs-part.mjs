import documentConfig from "../../../../../../constants/config/document-config.mjs";
import { icons } from "../../../../../../constants/display/icons.mjs";
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
       * The tab that a document of each type belongs to, used to reveal where a dragged document would land.
       * @type {Record<Teriock.Documents.CommonType, string>}
       */
      static TAB_FOR_SYSTEM_TYPE = {
        archetype: "classes",
        attunement: "effects",
        base: "effects",
        body: "inventory",
        condition: "effects",
        consequence: "effects",
        cover: "effects",
        equipment: "inventory",
        fluency: "tradecrafts",
        hack: "effects",
        mount: "inventory",
        power: "powers",
        rank: "classes",
        resource: "resources",
        species: "powers",
      };

      /** @type {Record<string, Partial<ApplicationTabsConfiguration>>} */
      static TABS = {
        primary: {
          tabs: [
            {
              icon: documentConfig.fluency.icon,
              id: "tradecrafts",
              label: "TERIOCK.SHEETS.Actor.TABS.Tradecrafts.title",
            },
            { icon: documentConfig.ability.icon, id: "abilities", label: "TERIOCK.SHEETS.Actor.TABS.Abilities.title" },
            {
              icon: documentConfig.inventory.icon,
              id: "inventory",
              label: "TERIOCK.SHEETS.Actor.TABS.Inventory.title",
            },
            { icon: documentConfig.rank.icon, id: "classes", label: "TERIOCK.SHEETS.Actor.TABS.Classes.title" },
            { icon: documentConfig.power.icon, id: "powers", label: "TERIOCK.SHEETS.Actor.TABS.Powers.title" },
            { icon: documentConfig.resource.icon, id: "resources", label: "TERIOCK.SHEETS.Actor.TABS.Resources.title" },
            { icon: documentConfig.condition.icon, id: "effects", label: "TERIOCK.SHEETS.Actor.TABS.Effects.title" },
            {
              icon: icons.pseudoDocument.affinity,
              id: "affinities",
              label: "TERIOCK.SHEETS.Actor.TABS.Affinities.title",
            },
            { icon: icons.ui.details, id: "details", label: "TERIOCK.SHEETS.Actor.TABS.Details.title" },
          ],
        },
      };

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

      /** @type {"LEFT"|"RIGHT"} */
      #tabDirection = "RIGHT";

      /** Apply the current tab tooltip direction without a full re-render. */
      #applyTabDirection() {
        for (const el of this.element.querySelectorAll(".actor-tabber-background .actor-tabber-tooltip-container")) {
          el.dataset.tooltipDirection = this.#tabDirection;
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
        const tab = this.constructor.TAB_FOR_SYSTEM_TYPE[TeriockDragDrop.payload?.document?.type];
        if (!tab || tab === this._activeTab) { return; }
        this.#tabBeforeDrag ??= this._activeTab;
        await this.setActiveTab(tab);
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
        const context = await super._prepareContext(options);
        if (foundry.utils.hasProperty(options, "window.detached")) {
          this.#tabDirection = options.window.detached ? "LEFT" : "RIGHT";
        }
        return Object.assign(context, {
          activeTab: this._activeTab,
          floatingTabs: game.settings.get("teriock", "floatingActorTabs"),
          tabDirection: this.#tabDirection,
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
