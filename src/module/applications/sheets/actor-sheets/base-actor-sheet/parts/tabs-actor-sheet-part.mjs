import { icons } from "../../../../../constants/display/icons.mjs";
import { documentOptions } from "../../../../../constants/options/document-options.mjs";
import TeriockTextEditor from "../../../../ux/text-editor.mjs";

//noinspection JSClosureCompilerSyntax,JSUnresolvedReference,JSUnusedGlobalSymbols
/**
 * @param {typeof BaseActorSheet} Base
 */
export default (Base) =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class TabsActorSheetPart extends Base {
    /** @type {Partial<ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: {
        changeTab: this._onChangeTab,
      },
    };

    /** @type {Record<string, Partial<ApplicationTabsConfiguration>>} */
    static TABS = {
      primary: {
        tabs: [
          {
            id: "tradecrafts",
            icon: documentOptions.fluency.icon,
            label: "TERIOCK.SHEETS.Actor.TABS.Tradecrafts.title",
          },
          {
            id: "abilities",
            icon: documentOptions.ability.icon,
            label: "TERIOCK.SHEETS.Actor.TABS.Abilities.title",
          },
          {
            id: "inventory",
            icon: documentOptions.equipment.icon,
            label: "TERIOCK.SHEETS.Actor.TABS.Inventory.title",
          },
          {
            id: "classes",
            icon: documentOptions.rank.icon,
            label: "TERIOCK.SHEETS.Actor.TABS.Classes.title",
          },
          {
            id: "powers",
            icon: documentOptions.power.icon,
            label: "TERIOCK.SHEETS.Actor.TABS.Powers.title",
          },
          {
            id: "resources",
            icon: documentOptions.resource.icon,
            label: "TERIOCK.SHEETS.Actor.TABS.Resources.title",
          },
          {
            id: "effects",
            icon: documentOptions.condition.icon,
            label: "TERIOCK.SHEETS.Actor.TABS.Effects.title",
          },
          {
            id: "protections",
            icon: icons.effect.protection,
            label: "TERIOCK.SHEETS.Actor.TABS.Protections.title",
          },
          {
            id: "details",
            icon: icons.ui.details,
            label: "TERIOCK.SHEETS.Actor.TABS.Details.title",
          },
        ],
      },
    };

    /**
     * Change tab.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async _onChangeTab(_event, target) {
      this._activeTab = target.dataset.tab;
      await this.render();
    }

    /** @inheritDoc */
    async _onDrop(event) {
      const dropData = TeriockTextEditor.getDragEventData(event);
      const out = await super._onDrop(event);
      if (out) {
        if (["equipment", "body", "mount"].includes(dropData.systemType)) {
          await this.setActiveTab("inventory");
        } else if (dropData.systemType === "fluency") {
          await this.setActiveTab("tradecrafts");
        } else if (dropData.systemType === "rank") {
          await this.setActiveTab("classes");
        } else if (["species", "power"].includes(dropData.systemType)) {
          await this.setActiveTab("powers");
        } else if (dropData.systemType === "resource") {
          await this.setActiveTab("resources");
        } else if (
          ["attunement", "consequence", "condition", "base"].includes(
            dropData.systemType,
          )
        ) {
          await this.setActiveTab("effects");
        }
      }
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      context.windowNavigation = !game.settings.get(
        "teriock",
        "floatingActorTabs",
      );
      context.activeTab = this._activeTab;
      return context;
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
  };
