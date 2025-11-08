import { TeriockDialog } from "../../applications/api/_module.mjs";
import { createAbility } from "../../helpers/create-effects.mjs";
import { fetchCategoryMembers } from "../../helpers/wiki/_module.mjs";
import {
  BlankMixin,
  ChangeableDocumentMixin,
  ChildDocumentMixin,
  CommonDocumentMixin,
  ParentDocumentMixin,
} from "../mixins/_module.mjs";

const { Item } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link Item} implementation.
 * @extends {Item}
 * @mixes ChangeableDocumentMixin
 * @mixes ChildDocumentMixin
 * @mixes ClientDocumentMixin
 * @mixes CommonDocumentMixin
 * @mixes ParentDocumentMixin
 * @property {EmbeddedCollection<Teriock.ID<TeriockEffect>, TeriockEffect>} effects
 */
export default class TeriockItem extends ChangeableDocumentMixin(
  ParentDocumentMixin(
    ChildDocumentMixin(CommonDocumentMixin(BlankMixin(Item))),
  ),
) {
  /** @inheritDoc */
  changesField = "itemChanges";

  /**
   * Checks if the item is active.
   * @returns {boolean}
   */
  get active() {
    return !this.isSuppressed && !this.disabled;
  }

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
   * Checks if the item is suppressed.
   * @returns {boolean} True if the item is suppressed, false otherwise.
   */
  get isSuppressed() {
    return this.system.suppressed;
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
    return this.effects.contents;
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
    await TeriockDialog.prompt({
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
      const progress = foundry.ui.notifications.info(
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

  /** @inheritDoc */
  async _preCreate(data, operations, user) {
    this.updateSource({ sort: game.time.serverTime });
    return await super._preCreate(data, operations, user);
  }

  /**
   * @inheritDoc
   * @yields {TeriockEffect}
   * @returns {Generator<TeriockEffect, void, void>}
   */
  *allApplicableEffects() {
    for (const effect of this.effects) {
      yield effect;
    }
  }

  /**
   * Initiates a bulk wiki pull operation for supported item types.
   * @returns {Promise<void>} Promise that resolves when the bulk pull dialog is complete.
   * @deprecated
   */
  async bulkWikiPull() {
    if (["ability", "equipment", "rank", "power"].includes(this.type)) {
      //noinspection JSUnusedGlobalSymbols
      const dialog = new TeriockDialog({
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

  /**
   * @inheritDoc
   * @param {"ActiveEffect"} embeddedName
   * @param {object[]} data
   * @param {DatabaseCreateOperation} [operation={}]
   * @returns {Promise<TeriockEffect[]>}
   */
  async createEmbeddedDocuments(embeddedName, data = [], operation = {}) {
    this._filterDocumentCreationData(embeddedName, data);
    return await super.createEmbeddedDocuments(embeddedName, data, operation);
  }

  /** @inheritDoc */
  getBodyParts() {
    return this.subs.filter((s) => s.type === "body");
  }

  /** @inheritDoc */
  getEquipment() {
    return this.subs.filter((s) => s.type === "equipment");
  }

  /** @inheritDoc */
  getRanks() {
    return this.subs.filter((s) => s.type === "rank");
  }

  /** @inheritDoc */
  async roll(options) {
    await this.system.roll(options);
  }
}
