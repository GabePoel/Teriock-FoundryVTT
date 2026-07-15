import documentConfig from "../../../../../../constants/config/document-config.mjs";
import { icons } from "../../../../../../constants/display/icons.mjs";
import TeriockTextEditor from "../../../../../ux/text-editor.mjs";

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
      async _onDrop(event) {
        const dropData = TeriockTextEditor.getDragEventData(event);
        const out = await super._onDrop(event);
        if (out) {
          if (["body", "equipment", "mount"].includes(dropData.systemType)) { await this.setActiveTab("inventory"); }
          else if (dropData.systemType === "fluency") { await this.setActiveTab("tradecrafts"); }
          else if (dropData.systemType === "rank") { await this.setActiveTab("classes"); }
          else if (["power", "species"].includes(dropData.systemType)) { await this.setActiveTab("powers"); }
          else if (dropData.systemType === "resource") { await this.setActiveTab("resources"); }
          else if (["attunement", "base", "condition", "consequence"].includes(dropData.systemType)) {
            await this.setActiveTab("effects");
          }
        }
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
