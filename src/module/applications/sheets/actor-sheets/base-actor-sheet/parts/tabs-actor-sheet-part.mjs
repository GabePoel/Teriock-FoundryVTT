import documentConfig from "../../../../../constants/config/document-config.mjs";
import { icons } from "../../../../../constants/display/icons.mjs";
import TeriockTextEditor from "../../../../ux/text-editor.mjs";

/**
 * @param {typeof BaseActorSheet} Base
 */
export default Base =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class TabsActorSheetPart extends Base {
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
          { icon: documentConfig.inventory.icon, id: "inventory", label: "TERIOCK.SHEETS.Actor.TABS.Inventory.title" },
          { icon: documentConfig.rank.icon, id: "classes", label: "TERIOCK.SHEETS.Actor.TABS.Classes.title" },
          { icon: documentConfig.power.icon, id: "powers", label: "TERIOCK.SHEETS.Actor.TABS.Powers.title" },
          { icon: documentConfig.resource.icon, id: "resources", label: "TERIOCK.SHEETS.Actor.TABS.Resources.title" },
          { icon: documentConfig.condition.icon, id: "effects", label: "TERIOCK.SHEETS.Actor.TABS.Effects.title" },
          { icon: icons.effect.protection, id: "protections", label: "TERIOCK.SHEETS.Actor.TABS.Protections.title" },
          { icon: icons.ui.details, id: "details", label: "TERIOCK.SHEETS.Actor.TABS.Details.title" },
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
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      return Object.assign(context, {
        activeTab: this._activeTab,
        floatingTabs: game.teriock.getSetting("floatingActorTabs"),
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
  };
