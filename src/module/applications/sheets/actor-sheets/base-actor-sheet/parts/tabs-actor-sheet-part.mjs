import { documentOptions } from "../../../../../constants/options/document-options.mjs";
import { makeIconClass } from "../../../../../helpers/utils.mjs";
import TeriockTextEditor from "../../../../ux/text-editor.mjs";

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
    class TabsActorSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          changeTab: this._onChangeTab,
        },
      };

      static TABS = {
        primary: {
          tabs: [
            {
              id: "tradecrafts",
              icon: makeIconClass(documentOptions.fluency.icon, "solid"),
              label: "Tradecrafts",
            },
            {
              id: "abilities",
              icon: makeIconClass(documentOptions.ability.icon, "solid"),
              label: "Abilities",
            },
            {
              id: "inventory",
              icon: makeIconClass(documentOptions.equipment.icon, "solid"),
              label: "Inventory",
            },
            {
              id: "classes",
              icon: makeIconClass(documentOptions.rank.icon, "solid"),
              label: "Classes",
            },
            {
              id: "powers",
              icon: makeIconClass(documentOptions.power.icon, "solid"),
              label: "Powers",
            },
            {
              id: "resources",
              icon: makeIconClass(documentOptions.resource.icon, "solid"),
              label: "Resources",
            },
            {
              id: "conditions",
              icon: makeIconClass(documentOptions.condition.icon, "solid"),
              label: "Effects",
            },
            {
              id: "protections",
              icon: makeIconClass("shield-halved", "solid"),
              label: "Protections",
            },
            {
              id: "notes",
              icon: makeIconClass("list-ul", "solid"),
              label: "Details",
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
            await this.setActiveTab("conditions");
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
    }
  );
};
