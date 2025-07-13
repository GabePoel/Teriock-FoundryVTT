const { api } = foundry.applications;
import { createAbility } from "../helpers/create-effects.mjs";
import { fetchCategoryMembers } from "../helpers/wiki.mjs";
import { BaseTeriockItem } from "./_base.mjs";

/**
 * @property {TeriockBaseItemData} system
 * @property {TeriockBaseItemSheet} sheet
 */
export default class TeriockItem extends BaseTeriockItem {
  /**
   * Gets the valid effects for this item.
   *
   * @returns {ActiveEffect[]} Array of transferred effects.
   * @inheritdoc
   */
  get validEffects() {
    return this.transferredEffects;
  }

  /**
   * Checks if the item is disabled.
   *
   * @returns {boolean} True if the item is disabled, false otherwise.
   */
  get disabled() {
    return this.system.disabled;
  }

  /**
   * Rolls the item, delegating to the system's roll method.
   *
   * @param {object} options - Options for the roll.
   * @returns {Promise<void>} Promise that resolves when the roll is complete.
   * @override
   */
  async roll(options) {
    await this.system.roll(options);
  }

  /**
   * Disables the item by setting its disabled property to true.
   *
   * @returns {Promise<void>} Promise that resolves when the item is disabled.
   */
  async disable() {
    await this.update({ "system.disabled": true });
  }

  /**
   * Enables the item by setting its disabled property to false.
   *
   * @returns {Promise<void>} Promise that resolves when the item is enabled.
   */
  async enable() {
    await this.update({ "system.disabled": false });
  }

  /**
   * Toggles the disabled state of the item.
   *
   * @returns {Promise<void>} Promise that resolves when the disabled state is toggled.
   */
  async toggleDisabled() {
    await this.update({ "system.disabled": !this.system.disabled });
  }

  /**
   * Helper method for bulk wiki pulling operations.
   *
   * @param {string} pullType - The type of pull operation ("pages" or "categories").
   * @returns {Promise<void>} Promise that resolves when the bulk pull is complete.
   * @private
   */
  async _bulkWikiPullHelper(pullType) {
    const pullTypeName = pullType === "pages" ? "Ability" : "Category";
    let toPull;
    await api.DialogV2.prompt({
      window: { title: "Pulling " + pullTypeName },
      content: `<input type="text" name="pullInput" placeholder="${pullTypeName} Name" />`,
      ok: {
        label: "Pull",
        callback: (event, button) => {
          let input = button.form.elements.namedItem("pullInput").value;
          if (input.startsWith(`${pullTypeName}:`)) {
            input = input.slice(`${pullTypeName}:`.length);
          }
          toPull = input;
        },
      },
    });
    const pages = await fetchCategoryMembers(toPull);
    /** @type {object} */
    const progress = ui.notifications.info(`Pulling Category:${toPull} from wiki.`, { progress: true });
    let pct = 0;
    for (const page of pages) {
      progress.update({ pct: pct, message: `Pulling ${page.title} from wiki.` });
      if (page.title.startsWith("Ability:")) {
        await createAbility(this, page.title.replace(/^Ability:/, ""), { notify: false });
      }
      pct += 1 / pages.length;
      progress.update({ pct: pct, message: `Pulling ${page.title} from wiki.` });
    }
  }

  /**
   * Initiates a bulk wiki pull operation for supported item types.
   *
   * @returns {Promise<void>} Promise that resolves when the bulk pull dialog is complete.
   * @private
   */
  async _bulkWikiPull() {
    if (["ability", "equipment", "rank", "power"].includes(this.type)) {
      const dialog = new api.DialogV2({
        window: { title: "Bulk Wiki Pull" },
        content: "What would you like to pull?",
        buttons: [
          {
            action: "pages",
            label: "Page",
            default: true,
          },
          {
            action: "categories",
            label: "Category",
            default: false,
          },
        ],
        submit: async (result) => this._bulkWikiPullHelper(result),
      });
      await dialog.render(true);
    }
  }
}
