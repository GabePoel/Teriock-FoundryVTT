// Allows for typing within mixin.
/** @import Item from "@client/documents/item.mjs"; */
const { api } = foundry.applications;
const { Item } = foundry.documents;
import { createAbility } from "../helpers/create-effects.mjs";
import { fetchCategoryMembers } from "../helpers/wiki.mjs";
import { ChildDocumentMixin } from "./mixins/child-mixin.mjs";
import { MixinParentDocument } from "./mixins/parent-mixin.mjs";

/**
 * @extends {Item}
 */
export default class TeriockItem extends MixinParentDocument(ChildDocumentMixin(Item)) {
  /** @override */
  async roll(options) {
    await this.system.roll(options);
  }

  /** @inheritdoc */
  get validEffects() {
    return this.transferredEffects;
  }

  /**
   * @returns {boolean}
   */
  get disabled() {
    return this.system.disabled;
  }

  /**
   * @returns {Promise<void>}
   */
  async disable() {
    if (!this.system.disabled) {
      this.update({ "system.disabled": true });
      const updates = this.effects.map((effect) => {
        return { _id: effect._id, disabled: true };
      });
      this.updateEmbeddedDocuments("ActiveEffect", updates);
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async enable() {
    if (this.system.disabled) {
      this.update({ "system.disabled": false });
      const toUpdate = this.effects.filter((effect) => !effect.system.forceDisabled);
      const updates = toUpdate.map((effect) => {
        return { _id: effect._id, disabled: false };
      });
      this.updateEmbeddedDocuments("ActiveEffect", updates);
    }
  }

  /**
   * @param {boolean} bool
   * @returns {Promise<void>}
   */
  async setDisabled(bool) {
    if (bool) {
      await this.disable();
    } else {
      await this.enable();
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async toggleDisabled() {
    await this.setDisabled(!this.system.disabled);
  }

  /**
   * @param {string} pullType
   * @returns {Promise<void>}
   */
  async _bulkWikiPullHelper(pullType) {
    const pullTypeName = pullType === "pages" ? "Ability" : "Category";
    let toPull;
    await api.DialogV2.prompt({
      window: { title: "Pulling " + pullTypeName },
      content: `<input type="text" name="pullInput" placeholder="${pullTypeName} Name" />`,
      ok: {
        label: "Pull",
        callback: (event, button, dialog) => {
          let input = button.form.elements.pullInput.value;
          if (input.startsWith(`${pullTypeName}:`)) {
            input = input.slice(`${pullTypeName}:`.length);
          }
          toPull = input;
        },
      },
    });
    const pages = await fetchCategoryMembers(toPull);
    const progress = ui.notifications.info(`Pulling Category:${toPull} from wiki.`, { progress: true });
    let pct = 0;
    for (const page of pages) {
      pct += 1 / pages.length;
      progress.update({ pct: pct, message: `Pulling ${page.title} from wiki.` });
      if (page.title.startsWith("Ability:")) {
        await createAbility(this, page.title.replace(/^Ability:/, ""), { notify: false });
      }
    }
  }

  /**
   * @returns {Promise<void>}
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
