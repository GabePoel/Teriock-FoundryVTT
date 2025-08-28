import { createAbility } from "../helpers/create-effects.mjs";
import { fetchCategoryMembers } from "../helpers/wiki/_module.mjs";
import { BaseTeriockItem } from "./_base.mjs";

const { api } = foundry.applications;

/**
 * @property {TeriockBaseItemData} system
 * @property {TeriockBaseItemSheet} sheet
 */
export default class TeriockItem extends BaseTeriockItem {
  /**
   * @inheritDoc
   * @returns {TeriockActor|null}
   */
  get actor() {
    return super.actor;
  }

  /**
   * Checks if the item is disabled.
   * @returns {boolean} True if the item is disabled, false otherwise.
   */
  get disabled() {
    return this.system.disabled;
  }

  /**
   * @inheritDoc
   * @returns {Readonly<Teriock.Documents.ItemModelMetadata>}
   */
  get metadata() {
    return /** @type {Readonly<Teriock.Documents.ItemModelMetadata>} */ super
      .metadata;
  }

  /**
   * @inheritDoc
   * @returns {TeriockEffect[]}
   */
  get validEffects() {
    return this.transferredEffects;
  }

  /**
   * Helper method for bulk wiki pulling operations.
   * @param {string} pullType - The type of pull operation ("pages" or "categories").
   * @returns {Promise<void>} Promise that resolves when the bulk pull is complete.
   * @private
   */
  async _bulkWikiPullHelper(pullType) {
    const pullTypeName = pullType === "pages" ? "Ability" : "Category";
    let toPull;
    await api.DialogV2.prompt({
      content: `<input type="text" name="pullInput" placeholder="${pullTypeName} Name" />`,
      ok: {
        callback: (_event, button) => {
          let input = button.form.elements.namedItem("pullInput").value;
          if (input.startsWith(`${pullTypeName}:`)) {
            input = input.slice(`${pullTypeName}:`.length);
          }
          toPull = input;
        },
        label: "Pull",
      },
      window: { title: "Pulling " + pullTypeName },
    });
    if (pullType === "categories") {
      const pages = await fetchCategoryMembers(toPull);
      const progress = ui.notifications.info(
        `Pulling Category:${toPull} from wiki.`,
        { progress: true },
      );
      let pct = 0;
      for (const page of pages) {
        progress.update({
          message: `Pulling ${page.title} from wiki.`,
          pct: pct,
        });
        if (page.title.startsWith("Ability:")) {
          await createAbility(this, page.title.replace(/^Ability:/, ""), {
            notify: false,
          });
        }
        pct += 1 / pages.length;
        progress.update({
          message: `Pulling ${page.title} from wiki.`,
          pct: pct,
        });
      }
      progress.update({ pct: 1 });
    } else {
      await createAbility(this, toPull.replace(/^Ability:/, ""));
    }
  }

  /**
   * Initiates a bulk wiki pull operation for supported item types.
   * @returns {Promise<void>} Promise that resolves when the bulk pull dialog is complete.
   */
  async bulkWikiPull() {
    if (["ability", "equipment", "rank", "power"].includes(this.type)) {
      const dialog = new api.DialogV2({
        buttons: [
          {
            action: "pages",
            default: true,
            label: "Page",
          },
          {
            action: "categories",
            default: false,
            label: "Category",
          },
        ],
        content: "What would you like to pull?",
        submit: async (result) => {
          await dialog.close();
          await this._bulkWikiPullHelper(result);
        },
        window: { title: "Bulk Wiki Pull" },
      });
      await dialog.render(true);
    }
  }

  /** @inheritDoc */
  async roll(options) {
    await this.system.roll(options);
  }
}
